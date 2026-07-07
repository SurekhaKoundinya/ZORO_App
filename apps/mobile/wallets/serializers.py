from rest_framework import serializers
from apps.wallets.models import Wallet


class AppWalletSerializer(serializers.ModelSerializer):
    """
    Read-only, user-facing shape. Deliberately excludes risk_level/risk_score/
    freeze_reason — those are internal fields the admin risk team manages
    (see apps.wallets.views.WalletViewSet), a user never needs or should see
    their own risk score.
    """
    class Meta:
        model = Wallet
        fields = ['id', 'address', 'network', 'currency', 'balance', 'status', 'created_at', 'last_activity']
