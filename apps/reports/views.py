import csv
import io
from datetime import datetime
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.views import APIView
from utils.permissions import IsAdminOrAbove
from utils.responses import success_response, error_response
from .models import Report
from .serializers import ReportSerializer, ReportGenerateSerializer


def _build_csv(report_type, date_from=None, date_to=None):
    """Build CSV bytes for given report type."""
    buf = io.StringIO()
    writer = csv.writer(buf)

    if report_type == 'users':
        from apps.users.models import User
        writer.writerow(['ID', 'Email', 'Name', 'Country', 'Status', 'KYC Level', 'Risk Score', 'Joined'])
        qs = User.objects.all()
        if date_from:
            qs = qs.filter(date_joined__date__gte=date_from)
        if date_to:
            qs = qs.filter(date_joined__date__lte=date_to)
        for u in qs:
            writer.writerow([str(u.id), u.email, u.full_name, u.country, u.status, u.kyc_level, u.risk_score, u.date_joined.strftime('%Y-%m-%d')])

    elif report_type == 'transactions':
        from apps.transactions.models import Transaction
        writer.writerow(['TX ID', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Network', 'Hash', 'Date'])
        qs = Transaction.objects.select_related('user').all()
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        for t in qs:
            writer.writerow([t.tx_id, t.user.email, t.tx_type, float(t.amount), t.currency, t.status, t.network, t.tx_hash, t.created_at.strftime('%Y-%m-%d %H:%M')])

    elif report_type == 'kyc':
        from apps.kyc.models import KYCRequest
        writer.writerow(['KYC ID', 'User', 'Level', 'Status', 'Submitted', 'Reviewed'])
        for k in KYCRequest.objects.select_related('user').all():
            writer.writerow([str(k.id), k.user.email, k.level, k.status,
                             k.submitted_at.strftime('%Y-%m-%d'), k.reviewed_at.strftime('%Y-%m-%d') if k.reviewed_at else ''])

    elif report_type == 'wallets':
        from apps.wallets.models import Wallet
        writer.writerow(['Wallet ID', 'Owner', 'Network', 'Currency', 'Balance', 'Status', 'Risk', 'Created'])
        for w in Wallet.objects.select_related('owner').all():
            writer.writerow([str(w.id), w.owner.email, w.network, w.currency, float(w.balance), w.status, w.risk_level, w.created_at.strftime('%Y-%m-%d')])

    elif report_type == 'revenue':
        from apps.transactions.models import Transaction
        from django.db.models import Sum
        writer.writerow(['Month', 'Total Volume', 'Fees', 'Count'])
        # Group by month
        from django.db.models.functions import TruncMonth
        rows = (Transaction.objects
                .filter(status='completed')
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(volume=Sum('amount'), fees=Sum('fee'), count=__import__('django.db.models', fromlist=['Count']).Count('id'))
                .order_by('month'))
        for r in rows:
            writer.writerow([r['month'].strftime('%b %Y'), float(r['volume'] or 0), float(r['fees'] or 0), r['count']])

    else:  # custom / referrals
        from apps.referrals.models import Referral
        writer.writerow(['Referrer', 'Referee', 'Tier', 'Commission', 'Date'])
        for ref in Referral.objects.select_related('referrer', 'referee').all():
            writer.writerow([ref.referrer.email, ref.referee.email, ref.tier, float(ref.commission), ref.created_at.strftime('%Y-%m-%d')])

    return buf.getvalue().encode('utf-8')


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdminOrAbove]
    filterset_fields = ['report_type', 'format', 'status']

    @action(detail=False, methods=['post'])
    def generate(self, request):
        s = ReportGenerateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        period = d.get('period') or timezone.now().strftime('%b %Y')
        name = f"{d['report_type'].title()} Report — {period}"
        report = Report.objects.create(
            name=name,
            report_type=d['report_type'],
            format=d['format'],
            period=period,
            generated_by=request.user,
            status='ready',
            completed_at=timezone.now(),
        )
        return success_response(data=ReportSerializer(report).data, status_code=201, message='Report generated')

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        report = self.get_object()
        csv_bytes = _build_csv(report.report_type)

        if report.format == 'csv':
            response = HttpResponse(csv_bytes, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{report.name}.csv"'
            return response

        elif report.format == 'xlsx':
            import openpyxl, io as _io
            wb = openpyxl.Workbook()
            ws = wb.active
            reader = csv.reader(io.StringIO(csv_bytes.decode('utf-8')))
            for row in reader:
                ws.append(row)
            buf = _io.BytesIO()
            wb.save(buf)
            buf.seek(0)
            response = HttpResponse(buf.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{report.name}.xlsx"'
            return response

        else:  # pdf
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib import colors
            import io as _io
            buf = _io.BytesIO()
            doc = SimpleDocTemplate(buf, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = [Paragraph(report.name, styles['Title'])]
            reader = list(csv.reader(io.StringIO(csv_bytes.decode('utf-8'))))
            if reader:
                table = Table(reader)
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FBD12D')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.black),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f9f9f9')]),
                ]))
                elements.append(table)
            doc.build(elements)
            buf.seek(0)
            response = HttpResponse(buf.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{report.name}.pdf"'
            return response
