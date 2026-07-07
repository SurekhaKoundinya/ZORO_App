from django.db.models import Sum, Count, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('user', 'wallet').all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['status', 'tx_type', 'network', 'currency', 'flagged', 'user']
    search_fields = ['tx_id', 'tx_hash', 'user__email', 'user__first_name']
    ordering_fields = ['amount', 'created_at', 'fee']

    @action(detail=True, methods=['patch'])
    def flag(self, request, pk=None):
        tx = self.get_object()
        tx.flagged = True
        tx.flag_reason = request.data.get('reason', 'Admin flagged')
        tx.save()
        return success_response(message=f'{tx.tx_id} flagged for review')

    @action(detail=True, methods=['patch'])
    def unflag(self, request, pk=None):
        tx = self.get_object()
        tx.flagged = False
        tx.flag_reason = ''
        tx.save()
        return success_response(message=f'{tx.tx_id} unflagged')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Transaction.objects.all()
        data = {
            'total': qs.count(),
            'completed': qs.filter(status='completed').count(),
            'pending': qs.filter(status='pending').count(),
            'failed': qs.filter(status='failed').count(),
            'flagged': qs.filter(flagged=True).count(),
            'total_volume': float(qs.filter(status='completed').aggregate(t=Sum('amount'))['t'] or 0),
            'by_type': {
                t: qs.filter(tx_type=t).count()
                for t in ['Deposit', 'Withdrawal', 'Transfer', 'Swap']
            },
        }
        return success_response(data=data)
