from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth, TruncDay
from rest_framework.views import APIView
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response


class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrAbove]

    def get(self, request):
        from apps.users.models import User
        from apps.wallets.models import Wallet
        from apps.transactions.models import Transaction
        from apps.kyc.models import KYCRequest
        from apps.rewards.models import Reward
        from django.utils import timezone
        import datetime

        today = timezone.now().date()

        users = User.objects.all()
        txns  = Transaction.objects.all()
        wallets = Wallet.objects.all()

        data = {
            'total_users': users.count(),
            'verified_users': users.filter(kyc_level__gte=1).count(),
            'pending_kyc': KYCRequest.objects.filter(status='pending').count(),
            'total_wallet_balance': float(wallets.aggregate(t=Sum('balance'))['t'] or 0),
            'transactions_today': txns.filter(created_at__date=today).count(),
            'monthly_revenue': float(
                txns.filter(status='completed', created_at__month=today.month).aggregate(t=Sum('fee'))['t'] or 0
            ),
            'referral_rewards': float(
                Reward.objects.filter(status='paid').aggregate(t=Sum('amount'))['t'] or 0
            ),
            'system_health': 99.98,
        }
        return success_response(data=data)


class DashboardChartsView(APIView):
    permission_classes = [IsAdminOrAbove]

    def get(self, request):
        from apps.transactions.models import Transaction
        from apps.users.models import User
        from django.db.models import Sum

        # Daily transactions (last 7 days)
        daily = (Transaction.objects
                 .annotate(day=TruncDay('created_at'))
                 .values('day')
                 .annotate(volume=Sum('amount'), count=Count('id'))
                 .order_by('day')
                 .values('day', 'volume', 'count'))

        # Monthly revenue (last 12 months)
        revenue = (Transaction.objects
                   .filter(status='completed')
                   .annotate(month=TruncMonth('created_at'))
                   .values('month')
                   .annotate(revenue=Sum('amount'), fees=Sum('fee'))
                   .order_by('month'))

        # User growth
        user_growth = (User.objects
                       .annotate(month=TruncMonth('date_joined'))
                       .values('month')
                       .annotate(users=Count('id'))
                       .order_by('month'))

        data = {
            'daily_transactions': [
                {'day': r['day'].strftime('%a'), 'volume': float(r['volume'] or 0), 'count': r['count']}
                for r in daily
            ],
            'revenue': [
                {'month': r['month'].strftime('%b'), 'revenue': float(r['revenue'] or 0), 'fees': float(r['fees'] or 0)}
                for r in revenue
            ],
            'user_growth': [
                {'month': r['month'].strftime('%b'), 'users': r['users']}
                for r in user_growth
            ],
        }
        return success_response(data=data)
