import uuid
from django.db import models
from apps.users.models import User


class KYCRequest(models.Model):
    STATUS = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('resubmit', 'Resubmit')]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kyc_requests')
    level        = models.IntegerField(default=1)
    status       = models.CharField(max_length=20, choices=STATUS, default='pending')
    reviewer     = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='kyc_reviews')
    notes        = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'kyc_requests'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.email} - Level {self.level} - {self.status}"


class KYCDocument(models.Model):
    DOC_TYPES = [
        ('passport', 'Passport'),
        ('national_id', 'National ID'),
        ('driver_license', 'Driver License'),
        ('utility_bill', 'Utility Bill'),
        ('bank_statement', 'Bank Statement'),
        ('selfie', 'Selfie'),
        ('liveness_selfie', 'Liveness Selfie'),
        ('other', 'Other'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kyc_request     = models.ForeignKey(KYCRequest, on_delete=models.CASCADE, related_name='documents')
    doc_type        = models.CharField(max_length=30, choices=DOC_TYPES)
    # Private S3 object key (bucket is AWS_DEFAULT_ACL='private') — never a public URL.
    file_key        = models.CharField(max_length=500)
    liveness_passed = models.BooleanField(null=True, blank=True)
    uploaded_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'kyc_documents'
        ordering = ['uploaded_at']

    def __str__(self):
        return f"{self.kyc_request_id} - {self.doc_type}"
