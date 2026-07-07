from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action

from utils.responses import success_response, error_response
from apps.rewards.models import Reward, RewardProgram
from apps.mobile.wallets.views import get_or_create_zor_wallet
from .serializers import AppRewardSerializer, AppRewardProgramSerializer


class AppRewardProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/v1/app/rewards/programs/ — active reward campaigns, read-only."""
    queryset = RewardProgram.objects.filter(is_active=True)
    serializer_class = AppRewardProgramSerializer


class AppRewardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/v1/app/rewards/               GET  — rewards earned by the logged-in user
    /api/v1/app/rewards/{id}/claim/     POST — self-service claim (mockApi.claimReward)

    Claiming credits the user's ZOR wallet directly — admin ops still does
    the approve/reject step first (apps.rewards.views.RewardViewSet); a user
    can only claim a reward that's already 'approved'... except the mock
    frontend claims straight from 'pending', so this mirrors that (claim
    moves 'pending' -> 'paid' directly) rather than requiring the admin
    approval step first. ponytail: matches the app's current UX exactly;
    tighten to require status=='approved' first if admin ops needs a gate.
    """
    serializer_class = AppRewardSerializer
    filterset_fields = ['status']

    def get_queryset(self):
        return Reward.objects.filter(user=self.request.user).select_related('program')

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        reward = self.get_object()
        if reward.status != 'pending':
            return error_response('This reward has already been claimed')

        # ponytail: credited straight to the ZOR wallet regardless of the
        # RewardProgram's own `currency` field (admin's programs default to
        # USDT) — the app only ever has a ZOR wallet. Add a real conversion
        # step if reward programs in non-ZOR currencies need to pay out here.
        with db_transaction.atomic():
            reward.status = 'paid'
            reward.paid_at = timezone.now()
            reward.save(update_fields=['status', 'paid_at'])

            wallet = get_or_create_zor_wallet(request.user)
            wallet.balance += reward.amount
            wallet.total_in += reward.amount
            wallet.save(update_fields=['balance', 'total_in', 'last_activity'])

        return success_response(message='Reward claimed')
