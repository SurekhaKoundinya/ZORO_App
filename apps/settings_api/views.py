"""
Settings API — profile, password, API keys, roles, platform settings.
These mirror the /settings page on the frontend.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from utils.permissions import IsSuperAdmin, IsAdminOrAbove
from utils.responses import success_response, error_response
from apps.users.models import User
from apps.users.serializers import UserDetailSerializer


class ProfileView(APIView):
    """GET/PATCH /api/v1/settings/profile/ — same as /auth/me/ but namespaced under settings."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success_response(data=UserDetailSerializer(request.user).data)

    def patch(self, request):
        allowed = ['first_name', 'last_name', 'country', 'phone', 'avatar']
        user = request.user
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return success_response(data=UserDetailSerializer(user).data, message='Profile updated')


class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current = request.data.get('current_password', '')
        new_pw  = request.data.get('new_password', '')
        confirm = request.data.get('confirm_password', '')
        if not request.user.check_password(current):
            return error_response('Current password is incorrect')
        if new_pw != confirm:
            return error_response('Passwords do not match')
        if len(new_pw) < 8:
            return error_response('Password must be at least 8 characters')
        request.user.set_password(new_pw)
        request.user.save()
        return success_response(message='Password updated successfully')


class RoleListView(APIView):
    """GET /api/v1/settings/roles/ — list all admin users for role management."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        admins = User.objects.filter(role__in=['super_admin', 'admin', 'kyc_agent', 'support'])
        return success_response(data=UserDetailSerializer(admins, many=True).data)

    def post(self, request):
        """Invite / create a new admin-role user."""
        email = request.data.get('email', '')
        role  = request.data.get('role', 'support')
        name  = request.data.get('name', '')
        if not email:
            return error_response('Email is required')
        if User.objects.filter(email=email).exists():
            return error_response('User with this email already exists')
        first, *rest = name.split(' ', 1)
        user = User.objects.create_user(
            email=email,
            password=User.objects.make_random_password(),
            first_name=first,
            last_name=rest[0] if rest else '',
            role=role,
            status='active',
        )
        return success_response(data=UserDetailSerializer(user).data, status_code=201, message='Role user created')


class RoleUpdateView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response('User not found', status_code=404)
        allowed_roles = ['super_admin', 'admin', 'kyc_agent', 'support']
        new_role = request.data.get('role')
        if new_role not in allowed_roles:
            return error_response(f'Role must be one of: {allowed_roles}')
        user.role = new_role
        user.save()
        return success_response(message=f'Role updated to {new_role}')

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response('User not found', status_code=404)
        user.role = 'user'
        user.save()
        return success_response(message='Role revoked')


class PlatformSettingsView(APIView):
    """GET/POST for general platform config (stored in cache for now)."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.core.cache import cache
        settings = cache.get('platform_settings', {
            'maintenance_mode': False,
            'kyc_required': True,
            'max_withdrawal_daily': 50000,
            'tx_fee_percent': 0.25,
            'referral_commission_percent': 5.0,
            'totp_required_for_admins': True,
        })
        return success_response(data=settings)

    def post(self, request):
        from django.core.cache import cache
        current = cache.get('platform_settings', {})
        current.update(request.data)
        cache.set('platform_settings', current, timeout=None)
        return success_response(data=current, message='Settings saved')
