import uuid
from django.db import models
from apps.users.models import User

class Referral(models.Model):
    TIER = [('diamond','Diamond'),('platinum','Platinum'),('gold','Gold'),('silver','Silver'),('bronze','Bronze')]
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referee     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referral_records')
    tier        = models.CharField(max_length=20, choices=TIER, default='bronze')
    commission  = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    paid_at     = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'referrals'
        unique_together = ('referrer', 'referee')
        ordering = ['-created_at']
