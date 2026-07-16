import secrets
from rest_framework import serializers
from .models import User


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    wallet_balance = serializers.SerializerMethodField()
    transaction_count = serializers.SerializerMethodField()
    referral_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name', 'avatar',
            'country', 'phone', 'role', 'status', 'kyc_level', 'risk_score',
            'referral_code', 'date_joined', 'last_login_ip',
            'wallet_balance', 'transaction_count', 'referral_count',
        ]
        read_only_fields = ('id', 'date_joined', 'referral_code')

    def get_wallet_balance(self, obj):
        total = obj.wallets.filter(status='active').aggregate(
            total=__import__('django.db.models', fromlist=['Sum']).Sum('balance')
        )['total']
        return float(total or 0)

    def get_transaction_count(self, obj):
        return obj.transactions.count()

    def get_referral_count(self, obj):
        return obj.referrals.count()


class UserDetailSerializer(UserListSerializer):
    class Meta(UserListSerializer.Meta):
        fields = UserListSerializer.Meta.fields + ['totp_enabled']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'country', 'phone', 'role', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        from apps.wallets.models import Wallet

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # every user gets a default wallet with the model's default $100 balance
        Wallet.objects.create(owner=user, address='0x' + secrets.token_hex(20))
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'country', 'phone', 'role', 'status', 'kyc_level', 'risk_score']