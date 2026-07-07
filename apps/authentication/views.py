import pyotp
import qrcode
import io
import base64
import hashlib
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from utils.responses import success_response, error_response
from utils.permissions import IsAdminOrAbove
from apps.users.models import User
from .models import APIKey, LoginAttempt
from .serializers import (
    CustomTokenObtainPairSerializer, TOTPSetupSerializer,
    PasswordChangeSerializer, APIKeySerializer, APIKeyCreateSerializer
)


class AdminLoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — returns access + refresh + user info."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        ip = request.META.get('REMOTE_ADDR', '')
        email = request.data.get('email', '')
        response = super().post(request, *args, **kwargs)
        success = response.status_code == 200
        LoginAttempt.objects.create(
            email=email, ip_address=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            success=success,
            failure_reason='' if success else 'Invalid credentials',
        )
        if success:
            try:
                user = User.objects.get(email=email)
                if user.role == 'user':
                    return error_response('Access denied — admin accounts only', status_code=403)
                user.last_login_ip = ip
                user.save(update_fields=['last_login_ip'])
            except User.DoesNotExist:
                pass
        return response


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — blacklists refresh token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return success_response(message='Logged out successfully')
        except Exception:
            return error_response('Invalid token')


class TOTPSetupView(APIView):
    """GET = generate QR, POST = verify & enable."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.totp_secret:
            user.totp_secret = pyotp.random_base32()
            user.save(update_fields=['totp_secret'])
        totp = pyotp.TOTP(user.totp_secret)
        uri = totp.provisioning_uri(user.email, issuer_name=settings.TOTP_APP_NAME)
        img = qrcode.make(uri)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        qr_b64 = base64.b64encode(buf.getvalue()).decode()
        return success_response(data={'qr_code': f'data:image/png;base64,{qr_b64}', 'secret': user.totp_secret})

    def post(self, request):
        serializer = TOTPSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(serializer.validated_data['totp_code']):
            return error_response('Invalid TOTP code')
        user.totp_enabled = True
        user.save(update_fields=['totp_enabled'])
        return success_response(message='2FA enabled successfully')


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return error_response('Current password is incorrect')
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return success_response(message='Password updated successfully')


class APIKeyListCreateView(APIView):
    permission_classes = [IsAdminOrAbove]

    def get(self, request):
        keys = APIKey.objects.filter(user=request.user)
        return success_response(data=APIKeySerializer(keys, many=True).data)

    def post(self, request):
        serializer = APIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_key, prefix, key_hash = APIKey.generate()
        key = APIKey.objects.create(
            user=request.user,
            name=serializer.validated_data['name'],
            key_hash=key_hash,
            prefix=prefix,
            permissions=serializer.validated_data.get('permissions', 'read'),
            expires_at=serializer.validated_data.get('expires_at'),
        )
        data = APIKeySerializer(key).data
        data['key'] = raw_key   # returned ONCE, never stored plain
        return success_response(data=data, status_code=201)


class APIKeyDeleteView(APIView):
    permission_classes = [IsAdminOrAbove]

    def delete(self, request, pk):
        try:
            key = APIKey.objects.get(pk=pk, user=request.user)
            key.delete()
            return success_response(message='API key deleted')
        except APIKey.DoesNotExist:
            return error_response('Not found', status_code=404)


class MeView(APIView):
    """GET /api/v1/auth/me/ — current user profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.users.serializers import UserDetailSerializer
        return success_response(data=UserDetailSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        allowed = ['first_name', 'last_name', 'country', 'phone', 'avatar']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        from apps.users.serializers import UserDetailSerializer
        return success_response(data=UserDetailSerializer(user).data)
