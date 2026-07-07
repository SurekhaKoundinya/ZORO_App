"""
Mobile auth views. Matches src/store/mockApi.js's AUTH section function for
function:
    sendOtp -> SendOtpView (purpose='register'/'login')
    verifyOtp -> VerifyOtpView
    loginWithPassword -> AppLoginView (email+password tab in LoginScreen)
    registerProfile -> ProfileView (used for both first-time setup and edits)
    setTransactionPin -> SetPinView
    sendPasswordResetOtp -> SendOtpView (purpose='reset')
    verifyPasswordResetOtp -> VerifyResetOtpView
    resetPassword -> ResetPasswordView

logout / refresh / me / change-password are reused as-is from
apps.authentication (see auth/urls.py) — no reason to duplicate them.
"""

from django.conf import settings
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from utils.responses import success_response, error_response
from apps.authentication.models import LoginAttempt
from apps.authentication.serializers import CustomTokenObtainPairSerializer
from apps.users.models import User
from apps.mobile.models import OTPRequest, AppProfile

from .serializers import (
    SendOtpSerializer, VerifyOtpSerializer, VerifyResetOtpSerializer,
    ResetPasswordSerializer, SetPinSerializer, AppProfileUpdateSerializer,
)
from .services import provision_app_user

RESET_TOKEN_SALT = 'zoro-app-password-reset'
RESET_TOKEN_MAX_AGE = 600  # 10 minutes


def _issue_jwt(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


def _profile_payload(user):
    wallet = user.wallets.filter(currency='ZOR').first()
    return {
        'id': str(user.id),
        'name': user.full_name,
        'email': user.email,
        'mobile': user.phone,
        'avatar': user.avatar,
        'country': user.country,
        'joinDate': user.date_joined.strftime('%b %d, %Y'),
        'walletAddress': wallet.address if wallet else None,
        'walletId': str(wallet.id) if wallet else None,
        'referralCode': user.referral_code,
        'balance': float(wallet.balance) if wallet else 0,
        'transactionCount': user.transactions.count(),
    }


# ─── OTP send / verify ──────────────────────────────────────────────
class SendOtpView(APIView):
    """
    POST /api/v1/app/auth/send-otp/ { mobile, purpose } -> { message }

    Deliberately does NOT check whether `mobile` is already registered here:
    RegisterScreen and LoginScreen's OTP tab both call this with only a
    mobile number — the register-vs-login *intent* is only known once the
    user picks a screen, and is resolved at verify-otp time instead (below).
    This also avoids leaking "is this number registered?" to an unauthenticated
    caller, which the pre-check would otherwise do.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']
        purpose = serializer.validated_data['purpose']

        OTPRequest.issue(mobile, purpose)
        data = {'message': 'OTP sent'}
        if settings.DEBUG:
            # ponytail: no SMS gateway configured — the code itself is only
            # ever logged (see OTPRequest.send), never returned by the API,
            # even in DEBUG. Check server logs (logger "zoro.otp") to test.
            data['debug_hint'] = 'OTP logged to the "zoro.otp" logger — no SMS gateway configured yet.'
        return success_response(data=data)


class VerifyOtpView(APIView):
    """
    POST /api/v1/app/auth/verify-otp/ { mobile, otp, mode }
    mode='register' -> creates the account, returns { access, refresh, user }
    mode='login'    -> logs an existing account in, same shape

    Matches the most recent unconsumed OTP for this phone regardless of the
    `purpose` it was issued with — send-otp doesn't know register-vs-login
    ahead of time (see SendOtpView), so one OTP has to serve either mode,
    same as the app's mock backend (a single hardcoded "1234" for both).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']
        otp = serializer.validated_data['otp']
        mode = serializer.validated_data['mode']

        otp_request = OTPRequest.objects.filter(
            phone=mobile, purpose__in=['register', 'login'], consumed=False
        ).order_by('-created_at').first()
        if not otp_request or not otp_request.verify(otp):
            return error_response('Invalid or expired OTP', status_code=400)

        if mode == 'register':
            if User.objects.filter(phone=mobile).exclude(phone='').exists():
                return error_response('This number is already registered — try logging in instead.')
            user = provision_app_user(mobile)
        else:
            user = User.objects.filter(phone=mobile).exclude(phone='').first()
            if not user:
                return error_response('No account found for this number. Try registering.', status_code=404)
            if user.status in ('suspended', 'banned'):
                return error_response('Your account has been suspended. Contact support.', status_code=403)

        tokens = _issue_jwt(user)
        LoginAttempt.objects.create(
            email=user.email or mobile, ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''), success=True,
        )
        return success_response(data={**tokens, 'user': _profile_payload(user)}, status_code=status.HTTP_200_OK)


# ─── Email + password login (second tab on LoginScreen) ────────────
class AppLoginView(TokenObtainPairView):
    """
    POST /api/v1/app/auth/login/ — { email, password } -> { access, refresh, user }
    Same CustomTokenObtainPairSerializer as the admin login (identical token
    shape). Every attempt is still written to LoginAttempt, so the admin
    portal's security views see app logins and admin logins in one place.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        ip = request.META.get('REMOTE_ADDR', '')
        email = request.data.get('email', '')
        response = super().post(request, *args, **kwargs)
        success = response.status_code == 200

        if success:
            user = User.objects.get(email=email)
            if user.status in ('suspended', 'banned'):
                success = False
                response = error_response('Your account has been suspended. Contact support.', status_code=403)
            else:
                user.last_login_ip = ip
                user.save(update_fields=['last_login_ip'])

        LoginAttempt.objects.create(
            email=email, ip_address=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            success=success,
            failure_reason='' if success else 'Invalid credentials or suspended account',
        )
        return response


# ─── Profile (ProfileSetupScreen + EditProfileScreen) ──────────────
class ProfileView(APIView):
    """GET/POST /api/v1/app/auth/profile/ — read or update the logged-in user's profile."""

    def get(self, request):
        return success_response(data=_profile_payload(request.user))

    def post(self, request):
        serializer = AppProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success_response(data=_profile_payload(user), message='Profile created')


# ─── Transaction PIN ────────────────────────────────────────────────
class SetPinView(APIView):
    """POST /api/v1/app/auth/set-pin/ { pin } — first-time set or change."""

    def post(self, request):
        serializer = SetPinSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile, _ = AppProfile.objects.get_or_create(user=request.user)
        profile.set_pin(serializer.validated_data['pin'])
        return success_response(message='Transaction PIN set successfully')


# ─── Password reset (OTP-based, ForgotPassword -> Otp -> ResetPassword) ──
class VerifyResetOtpView(APIView):
    """
    POST /api/v1/app/auth/verify-password-reset-otp/ { mobile, otp } -> { reset_token }
    reset_token is a signed, 10-minute token — NOT a session token — it can
    only be used against ResetPasswordView below.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyResetOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mobile = serializer.validated_data['mobile']
        otp = serializer.validated_data['otp']

        otp_request = OTPRequest.objects.filter(phone=mobile, purpose='reset', consumed=False).order_by('-created_at').first()
        if not otp_request or not otp_request.verify(otp):
            return error_response('Invalid or expired OTP', status_code=400)

        user = User.objects.filter(phone=mobile).exclude(phone='').first()
        if not user:
            return error_response('No account found for this number.', status_code=404)

        token = TimestampSigner(salt=RESET_TOKEN_SALT).sign(str(user.id))
        return success_response(data={'reset_token': token})


class ResetPasswordView(APIView):
    """POST /api/v1/app/auth/reset-password/ { reset_token, new_password }

    NOTE for the frontend team: mockApi.resetPassword() currently takes no
    arguments — ResetPasswordScreen needs to thread `reset_token` (from
    verifyPasswordResetOtp's response) and `new_password` through to this
    call. See the real API client (src/store/api.js) for the wired-up version.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user_id = TimestampSigner(salt=RESET_TOKEN_SALT).unsign(
                serializer.validated_data['reset_token'], max_age=RESET_TOKEN_MAX_AGE
            )
        except (BadSignature, SignatureExpired):
            return error_response('Reset link expired — request a new OTP.', status_code=400)

        user = User.objects.filter(id=user_id).first()
        if not user:
            return error_response('Account not found', status_code=404)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return success_response(message='Password reset successfully')
