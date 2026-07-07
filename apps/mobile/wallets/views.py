from rest_framework import viewsets
from rest_framework.views import APIView

from utils.responses import success_response, error_response
from apps.wallets.models import Wallet
from apps.mobile.auth.services import generate_zor_address
from .serializers import AppWalletSerializer


def get_or_create_zor_wallet(user):
    """
    Every app user should already have exactly one ZOR wallet (created at
    signup by auth.services.provision_app_user) — this get-or-create only
    exists as a safety net for accounts that predate this feature.
    """
    wallet = Wallet.objects.filter(owner=user, currency='ZOR').first()
    if wallet:
        return wallet
    return Wallet.objects.create(
        owner=user, address=generate_zor_address(), network='Zoro', currency='ZOR', balance=0,
    )


class AppWalletViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/app/wallets/          GET  — my wallet(s) (just the one ZOR wallet today)
    /api/v1/app/wallets/{id}/     GET

    Read-only on purpose: wallets are created at signup and only
    frozen/risk-reviewed by admin ops (apps.wallets.views.WalletViewSet).
    """
    serializer_class = AppWalletSerializer
    filterset_fields = ['status', 'network', 'currency']

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user)


class WalletDashboardView(APIView):
    """
    GET /api/v1/app/wallets/dashboard/ — matches mockApi.getWalletDashboard(),
    plus `income`/`outcome` (mockApi.getIncomeOutcome() is a separate mock
    function, but both read the same wallet row here — see api.js on the
    frontend, which calls this same endpoint for both):
    { id, balance, income, outcome, referralRewards, referralStatus, unlockInDays, dailyLimit, dailyUsed }
    """

    def get(self, request):
        from django.db.models import Sum
        from apps.referrals.models import Referral
        from apps.mobile.models import AppProfile

        wallet = get_or_create_zor_wallet(request.user)
        profile, _ = AppProfile.objects.get_or_create(user=request.user)

        referral_rewards = Referral.objects.filter(referrer=request.user).aggregate(t=Sum('commission'))['t'] or 0

        return success_response(data={
            'id': str(wallet.id),
            'balance': float(wallet.balance),
            'income': float(wallet.total_in),
            'outcome': float(wallet.total_out),
            'referralRewards': float(referral_rewards),
            'referralStatus': 'Unlocked' if referral_rewards > 0 else 'Locked',
            # ponytail: no vesting/lock schedule defined for referral rewards yet — always 0.
            'unlockInDays': 0,
            'dailyLimit': float(profile.daily_limit),
            'dailyUsed': float(profile.get_daily_spent()),
        })


class WalletAddressView(APIView):
    """GET /api/v1/app/wallets/address/ -> { address } — for the Receive/QR screen."""

    def get(self, request):
        wallet = get_or_create_zor_wallet(request.user)
        return success_response(data={'address': wallet.address})
