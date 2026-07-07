import uuid
from django.db import models
from apps.users.models import User


class Wallet(models.Model):
    NETWORKS = [
        ('Ethereum', 'Ethereum'), ('Bitcoin', 'Bitcoin'),
        ('Polygon', 'Polygon'), ('BSC', 'BSC'), ('Solana', 'Solana'),
        ('Tron', 'Tron'), ('Avalanche', 'Avalanche'),
        ('Zoro', 'Zoro'),  # the app's own internal token network — added for the mobile app's ZOR wallet
    ]
    STATUS = [('active', 'Active'), ('frozen', 'Frozen'), ('closed', 'Closed')]
    RISK   = [('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')]
    CURRENCIES = [
        ('USDT', 'USDT'), ('USDC', 'USDC'), ('BTC', 'BTC'),
        ('ETH', 'ETH'), ('BNB', 'BNB'), ('SOL', 'SOL'),
        ('ZOR', 'ZOR'),  # ZORO's native in-app token — every mobile app user gets exactly one ZOR wallet
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    address      = models.CharField(max_length=200, unique=True)
    network      = models.CharField(max_length=30, choices=NETWORKS, default='Ethereum')
    currency     = models.CharField(max_length=10, choices=CURRENCIES, default='USDT')
    balance      = models.DecimalField(max_digits=30, decimal_places=8, default=0)
    status       = models.CharField(max_length=20, choices=STATUS, default='active')
    risk_level   = models.CharField(max_length=20, choices=RISK, default='low')
    risk_score   = models.IntegerField(default=0)
    total_in     = models.DecimalField(max_digits=30, decimal_places=8, default=0)
    total_out    = models.DecimalField(max_digits=30, decimal_places=8, default=0)
    freeze_reason = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.owner.email} — {self.network} ({self.currency})"
