from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response
from .models import Reward, RewardProgram
from .serializers import RewardSerializer, RewardProgramSerializer


class RewardProgramViewSet(viewsets.ModelViewSet):
    queryset = RewardProgram.objects.all()
    serializer_class = RewardProgramSerializer
    permission_classes = [IsAdminOrAbove]


class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.select_related('user', 'program', 'approved_by').all()
    serializer_class = RewardSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['status', 'program']
    search_fields = ['user__email', 'user__first_name']

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        reward = self.get_object()
        reward.status = 'approved'
        reward.approved_by = request.user
        reward.save()
        return success_response(message='Reward approved')

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        reward = self.get_object()
        reward.status = 'rejected'
        reward.approved_by = request.user
        reward.save()
        return success_response(message='Reward rejected')

    @action(detail=True, methods=['patch'])
    def pay(self, request, pk=None):
        reward = self.get_object()
        reward.status = 'paid'
        reward.paid_at = timezone.now()
        reward.approved_by = request.user
        reward.save()
        return success_response(message='Reward marked as paid')

    @action(detail=False, methods=['patch'])
    def approve_all(self, request):
        """Approve all pending rewards at once."""
        updated = Reward.objects.filter(status='pending').update(
            status='approved', approved_by=request.user
        )
        return success_response(message=f'{updated} rewards approved')
