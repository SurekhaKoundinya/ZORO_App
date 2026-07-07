"""
Serializers for mobile auth. Signup itself is intentionally NOT a serializer
here — the app never collects a password at registration (see
RegisterScreen -> OtpVerificationScreen -> ProfileSetupScreen in the app),
so account creation happens in auth/services.provision_app_user() once the
OTP is verified, and this file only covers what needs validating around it.
"""

from rest_framework import serializers
from apps.users.models import User


class SendOtpSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=20)
    purpose = serializers.ChoiceField(choices=['register', 'login', 'reset'], default='login')


class VerifyOtpSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)
    mode = serializers.ChoiceField(choices=['register', 'login'])


class VerifyResetOtpSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    reset_token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


class SetPinSerializer(serializers.Serializer):
    pin = serializers.RegexField(r'^\d{4}$', error_messages={'invalid': 'PIN must be exactly 4 digits'})


class AppProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Backs both ProfileSetupScreen (first-time, after OTP register) and
    EditProfileScreen (later edits). The app sends a single `name` field —
    split into first/last the same way ProfileSetupScreen's avatar
    initials are derived (first two letters), matching what the UI shows.
    """
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mobile = serializers.CharField(source='phone', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['name', 'email', 'mobile', 'country', 'avatar']

    def update(self, instance, validated_data):
        name = validated_data.pop('name', None)
        if name:
            parts = name.strip().split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
            if not validated_data.get('avatar'):
                instance.avatar = name.strip()[:2].upper()
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
