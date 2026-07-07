from rest_framework import viewsets
from rest_framework.decorators import action
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response, error_response
from .models import Wallet
from .serializers import WalletSerializer


class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.select_related('owner').all()
    serializer_class = WalletSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['status', 'network', 'currency', 'risk_level', 'owner']
    search_fields = ['address', 'owner__email', 'owner__first_name']
    ordering_fields = ['balance', 'created_at', 'risk_score', 'last_activity']

    @action(detail=True, methods=['patch'])
    def freeze(self, request, pk=None):
        wallet = self.get_object()
        wallet.status = 'frozen'
        wallet.freeze_reason = request.data.get('reason', 'Admin action')
        wallet.save()
        return success_response(message=f'Wallet {wallet.address[:10]}… frozen')

    @action(detail=True, methods=['patch'])
    def unfreeze(self, request, pk=None):
        wallet = self.get_object()
        wallet.status = 'active'
        wallet.freeze_reason = ''
        wallet.save()
        return success_response(message=f'Wallet unfrozen')

    @action(detail=True, methods=['patch'])
    def risk_review(self, request, pk=None):
        wallet = self.get_object()
        risk_level = request.data.get('risk_level', wallet.risk_level)
        risk_score = request.data.get('risk_score', wallet.risk_score)
        wallet.risk_level = risk_level
        wallet.risk_score = int(risk_score)
        wallet.save()
        return success_response(data=WalletSerializer(wallet).data, message='Risk level updated')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        from django.db.models import Sum, Count
        qs = Wallet.objects.all()
        data = {
            'total_wallets': qs.count(),
            'active': qs.filter(status='active').count(),
            'frozen': qs.filter(status='frozen').count(),
            'total_balance': float(qs.aggregate(t=Sum('balance'))['t'] or 0),
            'high_risk': qs.filter(risk_level__in=['high', 'critical']).count(),
        }
        return success_response(data=data)
