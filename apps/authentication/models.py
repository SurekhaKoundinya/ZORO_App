import uuid
import secrets
from django.db import models
from apps.users.models import User


class APIKey(models.Model):
    PERMISSIONS = [
        ('read', 'Read Only'),
        ('write', 'Read + Write'),
        ('admin', 'Full Admin'),
    ]
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name        = models.CharField(max_length=100)
    key_hash    = models.CharField(max_length=128, unique=True)   # hashed key
    prefix      = models.CharField(max_length=12)                  # shown in UI e.g. "ZRO-LIVE-XXXX"
    permissions = models.CharField(max_length=20, choices=PERMISSIONS, default='read')
    is_active   = models.BooleanField(default=True)
    last_used   = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    expires_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'api_keys'
        ordering = ['-created_at']

    @staticmethod
    def generate():
        """Returns (raw_key, prefix, hash) — store hash only."""
        import hashlib
        raw = 'ZRO-LIVE-' + secrets.token_urlsafe(24)
        prefix = raw[:16]
        key_hash = hashlib.sha256(raw.encode()).hexdigest()
        return raw, prefix, key_hash


class LoginAttempt(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email      = models.EmailField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    success    = models.BooleanField(default=False)
    failure_reason = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_attempts'
        ordering = ['-created_at']
