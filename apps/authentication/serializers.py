from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.users.models import User
from .models import APIKey


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds user info to JWT token payload."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['name'] = user.full_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'name': user.full_name,
            'role': user.role,
            'avatar': user.avatar,
            'kyc_level': user.kyc_level,
        }
        return data


class TOTPSetupSerializer(serializers.Serializer):
    totp_code = serializers.CharField(max_length=6, min_length=6)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password     = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError('Passwords do not match')
        return data


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'prefix', 'permissions', 'is_active', 'last_used', 'created_at', 'expires_at']
        read_only_fields = ('id', 'prefix', 'last_used', 'created_at')


class APIKeyCreateSerializer(serializers.Serializer):
    name        = serializers.CharField(max_length=100)
    permissions = serializers.ChoiceField(choices=['read', 'write', 'admin'], default='read')
    expires_at  = serializers.DateTimeField(required=False, allow_null=True)
