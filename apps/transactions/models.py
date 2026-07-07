import uuid
from django.db import models
from apps.users.models import User
from apps.wallets.models import Wallet


class Transaction(models.Model):
    TYPES   = [('Deposit','Deposit'),('Withdrawal','Withdrawal'),('Transfer','Transfer'),('Swap','Swap')]
    STATUS  = [('completed','Completed'),('pending','Pending'),('failed','Failed'),('processing','Processing')]
    NETWORKS = [
        ('Ethereum','Ethereum'),('Bitcoin','Bitcoin'),('Polygon','Polygon'),
        ('BSC','BSC'),('Solana','Solana'),('Tron','Tron'),
        ('Zoro','Zoro'),  # internal P2P transfers between app users' ZOR wallets
    ]
    # Only meaningful for internal Zoro-network P2P transfers (see apps.mobile.transactions) —
    # blank for every admin-side Deposit/Withdrawal/Swap against an external chain.
    DIRECTIONS = [('sent', 'Sent'), ('received', 'Received')]

    id       = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tx_id    = models.CharField(max_length=30, unique=True)   # e.g. TXN-001842
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    wallet   = models.ForeignKey(Wallet, null=True, blank=True, on_delete=models.SET_NULL, related_name='transactions')
    tx_type  = models.CharField(max_length=20, choices=TYPES)
    amount   = models.DecimalField(max_digits=30, decimal_places=8)
    currency = models.CharField(max_length=10)
    status   = models.CharField(max_length=20, choices=STATUS, default='pending')
    tx_hash  = models.CharField(max_length=200, blank=True)
    network  = models.CharField(max_length=30, choices=NETWORKS, default='Ethereum')
    fee      = models.DecimalField(max_digits=18, decimal_places=8, default=0)
    notes    = models.TextField(blank=True)
    flagged  = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    # ── Added for the mobile app's P2P transfers (both fields blank/null for
    # every existing admin-side transaction type — purely additive) ──
    direction    = models.CharField(max_length=10, choices=DIRECTIONS, blank=True)
    counterparty = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.tx_id:
            import random
            self.tx_id = f"TXN-{random.randint(1000000, 9999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tx_id} — {self.user.email}"
