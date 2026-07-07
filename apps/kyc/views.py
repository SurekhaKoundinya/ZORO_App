from django.db import models
from django.db.models import Avg, F, ExpressionWrapper, DurationField
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from utils.permissions import IsKYCAgent
from utils.responses import success_response, error_response
from utils.storage import upload_kyc_file, get_presigned_url
from apps.notifications.models import Notification
from apps.system_logs.models import SystemLog

from .models import KYCRequest, KYCDocument
from .serializers import (
    KYCRequestListSerializer,
    KYCRequestDetailSerializer,
    KYCDocumentSerializer,
    KYCRejectSerializer,
    KYCResubmitSerializer,
)


class KYCViewSet(viewsets.ModelViewSet):
    """
    /api/v1/kyc/                 GET  (list, tabs via ?status=)  POST (user submits a request)
    /api/v1/kyc/{id}/            GET  (review panel detail)
    /api/v1/kyc/{id}/approve/    PATCH
    /api/v1/kyc/{id}/reject/     PATCH  { "reason": "..." }
    /api/v1/kyc/{id}/resubmit/   PATCH  { "notes": "..." }
    /api/v1/kyc/stats/           GET  (top summary cards + tab counts)
    """
    queryset = KYCRequest.objects.select_related('user', 'reviewer').prefetch_related('documents').all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filterset_fields = ['status', 'level']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'user__country']
    ordering_fields = ['submitted_at', 'reviewed_at']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return KYCRequestListSerializer
        return KYCRequestDetailSerializer

    def get_permissions(self):
        # Any authenticated user can submit/list/view their own KYC request(s)
        # — get_queryset below already scopes list/retrieve down to "my own"
        # for non-agents, so those two actions must be reachable by any
        # authenticated user, not agent-only. Everything else (review,
        # approve/reject/resubmit, stats) is agent-only.
        if self.action in ('create', 'list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsKYCAgent()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'create':
            return qs
        if not IsKYCAgent().has_permission(self.request, self):
            qs = qs.filter(user=self.request.user)
        return qs

    # ── Submit (user-facing) ──────────────────────────────────────
    def create(self, request, *args, **kwargs):
        level = int(request.data.get('level', 1))

        kyc = KYCRequest.objects.create(user=request.user, level=level)

        files = request.FILES.getlist('documents')
        doc_types = request.data.getlist('documentTypes') if hasattr(request.data, 'getlist') else []
        for f, doc_type in zip(files, doc_types):
            key = f"kyc/{kyc.id}/{doc_type}_{f.name}"
            upload_kyc_file(f, key)
            KYCDocument.objects.create(kyc_request=kyc, doc_type=doc_type, file_key=key)

        return success_response(
            data=KYCRequestDetailSerializer(kyc).data,
            message='KYC request submitted',
            status_code=201,
        )

    # ── Review actions (agent-facing) ─────────────────────────────
    def _log(self, request, kyc, action_name, severity='info'):
        SystemLog.objects.create(
            actor=request.user,
            action=f"KYC {action_name} — {kyc.user.email} (Level {kyc.level})",
            category='KYC',
            severity=severity,
            ip_address=request.META.get('REMOTE_ADDR'),
            status_code=200,
            metadata={'kyc_request_id': str(kyc.id), 'status': kyc.status},
        )

    def _notify(self, kyc, title, message, notif_type='info'):
        Notification.objects.create(recipient=kyc.user, title=title, message=message, notif_type=notif_type)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        kyc = self.get_object()
        if kyc.status == 'approved':
            return error_response('This KYC request is already approved')

        kyc.status = 'approved'
        kyc.reviewer = request.user
        kyc.reviewed_at = timezone.now()
        kyc.save(update_fields=['status', 'reviewer', 'reviewed_at'])

        kyc.user.kyc_level = kyc.level
        kyc.user.save(update_fields=['kyc_level'])

        self._notify(kyc, 'KYC Approved', f'Your Level {kyc.level} KYC verification has been approved.', 'success')
        self._log(request, kyc, 'approved', severity='success')
        return success_response(data=KYCRequestDetailSerializer(kyc).data, message='KYC approved')

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        serializer = KYCRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        kyc = self.get_object()
        kyc.status = 'rejected'
        kyc.reviewer = request.user
        kyc.notes = serializer.validated_data['reason']
        kyc.reviewed_at = timezone.now()
        kyc.save(update_fields=['status', 'reviewer', 'notes', 'reviewed_at'])

        self._notify(kyc, 'KYC Rejected', f"Your KYC submission was rejected: {kyc.notes}", 'danger')
        self._log(request, kyc, 'rejected', severity='warning')
        return success_response(data=KYCRequestDetailSerializer(kyc).data, message='KYC rejected')

    @action(detail=True, methods=['patch'])
    def resubmit(self, request, pk=None):
        serializer = KYCResubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        kyc = self.get_object()
        kyc.status = 'resubmit'
        kyc.reviewer = request.user
        kyc.notes = serializer.validated_data.get('notes', '')
        kyc.save(update_fields=['status', 'reviewer', 'notes'])

        self._notify(kyc, 'Resubmission Requested', kyc.notes or 'Please resubmit your KYC documents.', 'warning')
        self._log(request, kyc, 'resubmission requested')
        return success_response(data=KYCRequestDetailSerializer(kyc).data, message='Resubmission requested')

    # ── Dashboard summary cards + tab counts ──────────────────────
    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        today = timezone.now().date()

        by_status = {
            row['status']: row['count']
            for row in qs.values('status').annotate(count=models.Count('id'))
        }

        reviewed_today_qs = qs.filter(
            reviewed_at__date=today, status__in=['approved', 'rejected']
        ).annotate(
            duration=ExpressionWrapper(F('reviewed_at') - F('submitted_at'), output_field=DurationField())
        )
        avg_duration = reviewed_today_qs.aggregate(avg=Avg('duration'))['avg']
        avg_review_hours = round(avg_duration.total_seconds() / 3600, 1) if avg_duration else 0

        return success_response(data={
            'pendingReview': by_status.get('pending', 0),
            'approvedToday': qs.filter(status='approved', reviewed_at__date=today).count(),
            'rejectedToday': qs.filter(status='rejected', reviewed_at__date=today).count(),
            'avgReviewTimeHours': avg_review_hours,
            'tabCounts': {
                'pending': by_status.get('pending', 0),
                'approved': by_status.get('approved', 0),
                'rejected': by_status.get('rejected', 0),
                'resubmit': by_status.get('resubmit', 0),
            },
        })


class KYCDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """/api/v1/kyc/documents/{id}/preview/ -> signed, time-limited URL for the eye/preview icon."""
    queryset = KYCDocument.objects.select_related('kyc_request', 'kyc_request__user').all()
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsKYCAgent]

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        doc = self.get_object()
        url = get_presigned_url(doc.file_key)
        return success_response(data={'url': url, 'expiresIn': 300})
