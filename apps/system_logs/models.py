import uuid
from django.db import models
from django.conf import settings


class SystemLog(models.Model):
    SEVERITY   = [('info','Info'),('warning','Warning'),('danger','Danger'),('success','Success')]
    CATEGORIES = [
        ('AUTH','Auth'),('KYC','KYC'),('TRANSACTION','Transaction'),
        ('WALLET','Wallet'),('SYSTEM','System'),('API','API'),
        ('SECURITY','Security'),('REPORT','Report'),('FRAUD','Fraud'),('ADMIN','Admin'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    log_id      = models.CharField(max_length=20, unique=True, blank=True)   # e.g. LOG-8821
    actor       = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='system_logs'
    )
    actor_label = models.CharField(max_length=100, default='system')  # "system", "fraud-engine", email
    action      = models.TextField()
    category    = models.CharField(max_length=20, choices=CATEGORIES, default='SYSTEM')
    severity    = models.CharField(max_length=20, choices=SEVERITY, default='info')
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    status_code = models.IntegerField(null=True, blank=True)
    metadata    = models.JSONField(default=dict, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'system_logs'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.log_id:
            import random
            self.log_id = f"LOG-{random.randint(1000, 9999)}"
        if self.actor and not self.actor_label:
            self.actor_label = self.actor.email
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.severity.upper()}] {self.category} — {self.action[:60]}"
