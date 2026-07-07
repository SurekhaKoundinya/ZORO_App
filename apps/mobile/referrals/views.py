"""
GET /api/v1/app/referrals/ — one call, matching mockApi.getReferralData()'s
full shape exactly:
    { referralCode, totalUsers, successfulReferrals, totalRewards,
      pendingRewards, rewardPerUser, referredUsers: [{name, joinedAt, status, reward}] }

`totalUsers` vs `successfulReferrals`: every signup with a valid referral
code creates a Referral row immediately (see apps/mobile/auth/services.py /
signup flow), so both counts are the same today — kept as two separate
numbers because the app's UI shows them separately, and because a future
"only count a referral once the referee finishes KYC" rule would make them
diverge again without a UI change.
ponytail: rewardPerUser is a flat constant, not a real per-tier lookup —
add REFERRAL_REWARD_PER_USER tiers if the referral program grows one.
"""

from django.db.models import Sum
from rest_framework.views import APIView

from utils.responses import success_response
from apps.referrals.models import Referral

REWARD_PER_USER = 50  # ZOR — ponytail: flat rate, see module docstring


class ReferralDataView(APIView):
    def get(self, request):
        qs = Referral.objects.filter(referrer=request.user).select_related('referee')
        total_rewards = qs.aggregate(t=Sum('commission'))['t'] or 0
        pending_rewards = qs.filter(paid_at__isnull=True).aggregate(t=Sum('commission'))['t'] or 0

        referred_users = [{
            'name': r.referee.full_name,
            'joinedAt': r.created_at.strftime('%b %d, %Y'),
            'status': 'active' if r.paid_at or r.commission > 0 else 'pending',
            'reward': float(r.commission),
        } for r in qs]

        return success_response(data={
            'referralCode': request.user.referral_code,
            'totalUsers': qs.count(),
            'successfulReferrals': qs.count(),
            'totalRewards': float(total_rewards),
            'pendingRewards': float(pending_rewards),
            'rewardPerUser': REWARD_PER_USER,
            'referredUsers': referred_users,
        })
