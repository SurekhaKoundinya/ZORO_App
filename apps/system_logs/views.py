from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response
from .models import SystemLog
from .serializers import SystemLogSerializer


class SystemLogViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    """Read-only — logs are created by middleware & signals, not via API."""
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['severity', 'category', 'actor']
    search_fields = ['action', 'actor_label', 'ip_address', 'log_id']
    ordering_fields = ['created_at', 'severity']
