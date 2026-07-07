import uuid
from django.db import models
from apps.users.models import User


class Report(models.Model):
    TYPES   = [
        ('revenue','Revenue'), ('users','Users'), ('transactions','Transactions'),
        ('kyc','KYC'), ('wallets','Wallets'), ('referrals','Referrals'), ('custom','Custom'),
    ]
    FORMATS = [('csv','CSV'), ('xlsx','Excel'), ('pdf','PDF')]
    STATUS  = [('queued','Queued'), ('generating','Generating'), ('ready','Ready'), ('failed','Failed')]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name         = models.CharField(max_length=200)
    report_type  = models.CharField(max_length=30, choices=TYPES)
    format       = models.CharField(max_length=10, choices=FORMATS, default='csv')
    status       = models.CharField(max_length=20, choices=STATUS, default='queued')
    period       = models.CharField(max_length=50, blank=True)   # e.g. "Jun 2026", "Q2 2026"
    file_url     = models.URLField(blank=True)
    file_size    = models.CharField(max_length=20, blank=True)
    row_count    = models.IntegerField(default=0)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reports')
    created_at   = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
