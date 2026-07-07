import uuid
from django.db import models
from apps.users.models import User

class RewardProgram(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name        = models.CharField(max_length=100)
    description = models.TextField()
    amount      = models.DecimalField(max_digits=18, decimal_places=2)
    currency    = models.CharField(max_length=10, default='USDT')
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

class Reward(models.Model):
    STATUS = [('pending','Pending'),('approved','Approved'),('paid','Paid'),('rejected','Rejected')]
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rewards')
    program     = models.ForeignKey(RewardProgram, on_delete=models.CASCADE)
    amount      = models.DecimalField(max_digits=18, decimal_places=8)
    status      = models.CharField(max_length=20, choices=STATUS, default='pending')
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_rewards')
    created_at  = models.DateTimeField(auto_now_add=True)
    paid_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'rewards'
        ordering = ['-created_at']
