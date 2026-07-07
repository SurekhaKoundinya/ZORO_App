from rest_framework.views import APIView

from utils.responses import success_response
from apps.wallets.models import Wallet
from apps.transactions.models import Transaction
from apps.notifications.models import Notification
from apps.mobile.wallets.serializers import AppWalletSerializer
from apps.mobile.transactions.serializers import AppTransactionSerializer


class AppDashboardView(APIView):
    """
    /api/v1/app/dashboard/ — one call combining wallet balance, last 5
    transactions, unread notification count, KYC level.

    NOTE: HomeScreen in the actual app calls getWalletDashboard() +
    getTransactionList() + getKycStatus() + getMarketOverview() separately
    rather than one combined endpoint (see src/screens/Home/HomeScreen.jsx),
    so nothing currently calls this. Left in as an optional convenience
    endpoint — a future screen redesign that wants one round-trip instead
    of four can switch to this instead of the four separate calls.
    """

    def get(self, request):
        user = request.user
        wallets = Wallet.objects.filter(owner=user)
        recent_tx = Transaction.objects.filter(user=user).select_related('wallet')[:5]
        unread = Notification.objects.filter(recipient=user, is_read=False).count()

        return success_response(data={
            'wallets': AppWalletSerializer(wallets, many=True).data,
            'recent_transactions': AppTransactionSerializer(recent_tx, many=True).data,
            'unread_notifications': unread,
            'kyc_level': user.kyc_level,
            'referral_code': user.referral_code,
        })
