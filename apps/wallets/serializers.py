from rest_framework import serializers
from .models import Wallet


class WalletSerializer(serializers.ModelSerializer):
    owner_name  = serializers.ReadOnlyField(source='owner.full_name')
    owner_email = serializers.ReadOnlyField(source='owner.email')
    owner_avatar = serializers.ReadOnlyField(source='owner.avatar')

    class Meta:
        model = Wallet
        fields = [
            'id', 'owner', 'owner_name', 'owner_email', 'owner_avatar',
            'address', 'network', 'currency', 'balance', 'status',
            'risk_level', 'risk_score', 'total_in', 'total_out',
            'freeze_reason', 'created_at', 'last_activity',
        ]
        read_only_fields = ('id', 'created_at', 'last_activity', 'total_in', 'total_out')
