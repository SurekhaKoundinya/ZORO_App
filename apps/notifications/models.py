import uuid
from django.db import models
from apps.users.models import User


class Notification(models.Model):
    TYPES = [
        ('info','Info'),('warning','Warning'),
        ('success','Success'),('danger','Danger'),
    ]
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    notif_type = models.CharField(max_length=20, choices=TYPES, default='info')
    is_read    = models.BooleanField(default=False)
    link       = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
