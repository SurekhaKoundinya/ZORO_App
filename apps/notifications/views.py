from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from utils.responses import success_response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return success_response(message='Marked as read')

    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return success_response(message=f'{count} notifications marked as read')
