from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    user_name   = serializers.ReadOnlyField(source='user.full_name')
    user_email  = serializers.ReadOnlyField(source='user.email')
    user_avatar = serializers.ReadOnlyField(source='user.avatar')
    wallet_address = serializers.ReadOnlyField(source='wallet.address')

    class Meta:
        model = Transaction
        fields = [
            'id', 'tx_id', 'user', 'user_name', 'user_email', 'user_avatar',
            'wallet', 'wallet_address', 'tx_type', 'amount', 'currency',
            'status', 'tx_hash', 'network', 'fee', 'notes',
            'flagged', 'flag_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = ('id', 'tx_id', 'created_at', 'updated_at')
