from rest_framework import serializers
from apps.transactions.models import Transaction


class AppTransactionSerializer(serializers.ModelSerializer):
    """
    Matches mockApi's transaction shape exactly:
    { id, type: 'sent'|'received', status, counterparty, address, amount, hash, createdAt }
    `type`/`counterparty`/`address` only make sense for the P2P transfers this
    app creates (direction/counterparty are blank for anything admin-side).
    """
    id = serializers.CharField(source='tx_id', read_only=True)
    type = serializers.CharField(source='direction', read_only=True)
    counterparty = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    hash = serializers.CharField(source='tx_hash', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'type', 'status', 'counterparty', 'address', 'amount', 'hash', 'createdAt']

    def get_counterparty(self, obj):
        return obj.counterparty.full_name if obj.counterparty else ''

    def get_address(self, obj):
        if not obj.counterparty:
            return ''
        wallet = obj.counterparty.wallets.filter(currency='ZOR').first()
        return wallet.address if wallet else ''
