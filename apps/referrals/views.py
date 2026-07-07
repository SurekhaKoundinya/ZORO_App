from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from utils.permissions import IsAdminOrAbove
from .models import Referral
from .serializers import ReferralSerializer

class ReferralViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Referral.objects.select_related('referrer', 'referee').all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['tier', 'referrer']

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        data = (Referral.objects
                .values('referrer__id', 'referrer__email', 'referrer__first_name', 'tier')
                .annotate(total=Count('id'), earnings=Sum('commission'))
                .order_by('-total')[:50])
        return Response({'success': True, 'data': list(data)})
