from django.db.models import Count, Sum, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response, error_response
from .models import User
from .serializers import UserListSerializer, UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.prefetch_related('wallets', 'transactions', 'referrals').all()
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['status', 'role', 'kyc_level', 'country']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'risk_score', 'kyc_level']
    ordering = ['-date_joined']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserListSerializer

    @action(detail=True, methods=['patch'])
    def suspend(self, request, pk=None):
        user = self.get_object()
        user.status = 'suspended'
        user.save()
        return success_response(message=f'User {user.email} suspended')

    @action(detail=True, methods=['patch'])
    def reactivate(self, request, pk=None):
        user = self.get_object()
        user.status = 'active'
        user.save()
        return success_response(message=f'User {user.email} reactivated')

    @action(detail=True, methods=['patch'])
    def approve_kyc(self, request, pk=None):
        user = self.get_object()
        level = int(request.data.get('level', user.kyc_level + 1))
        user.kyc_level = min(level, 3)
        user.save()
        return success_response(message=f'KYC Level {user.kyc_level} approved for {user.email}')

    @action(detail=True, methods=['patch'])
    def freeze_wallet(self, request, pk=None):
        user = self.get_object()
        frozen = user.wallets.filter(status='active').update(status='frozen')
        return success_response(message=f'{frozen} wallet(s) frozen for {user.email}')

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = User.objects.all()
        data = {
            'total': qs.count(),
            'active': qs.filter(status='active').count(),
            'suspended': qs.filter(status='suspended').count(),
            'pending': qs.filter(status='pending').count(),
            'kyc_breakdown': {
                'none': qs.filter(kyc_level=0).count(),
                'level1': qs.filter(kyc_level=1).count(),
                'level2': qs.filter(kyc_level=2).count(),
                'level3': qs.filter(kyc_level=3).count(),
            },
        }
        return success_response(data=data)
