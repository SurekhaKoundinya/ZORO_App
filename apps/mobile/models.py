"""
Mobile-app-only data. These four models hold state that has no equivalent in
the admin portal's models (apps.users.User, apps.wallets.Wallet, etc.) — a
transaction PIN, OTP codes, saved P2P contacts, linked bank accounts. Every
row here points back at the shared `User`/`Wallet` via FK, so admin ops can
still see everything through Django admin if needed; nothing is duplicated,
this is genuinely new data the admin side never had.
"""

import uuid
import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from django.utils import timezone

from apps.users.models import User


class AppProfile(models.Model):
    """One row per app user: transaction PIN + daily spend tracking.

    Kept separate from `apps.users.User` on purpose — these fields are
    mobile-app-specific and would be dead weight on every admin screen that
    touches User otherwise.
    """
    user             = models.OneToOneField(User, on_delete=models.CASCADE, related_name='app_profile')
    pin_hash         = models.CharField(max_length=128, blank=True)  # hashed 4-digit transaction PIN
    daily_limit      = models.DecimalField(max_digits=18, decimal_places=2, default=10000)
    daily_spent      = models.DecimalField(max_digits=18, decimal_places=2, default=0)
    daily_spent_date = models.DateField(null=True, blank=True)  # last date daily_spent was accumulated for

    class Meta:
        db_table = 'app_profiles'

    # ── PIN helpers ────────────────────────────────────────────────
    def set_pin(self, raw_pin):
        self.pin_hash = make_password(raw_pin)
        self.save(update_fields=['pin_hash'])

    def check_pin(self, raw_pin):
        if not self.pin_hash:
            return False
        return check_password(raw_pin, self.pin_hash)

    # ── Daily limit helpers ────────────────────────────────────────
    # ponytail: reset-on-read instead of a scheduled midnight-reset job —
    # one comparison is simpler than wiring a celery beat task for this.
    def get_daily_spent(self):
        today = timezone.localdate()
        if self.daily_spent_date != today:
            return 0
        return self.daily_spent

    def add_daily_spend(self, amount):
        today = timezone.localdate()
        current = self.get_daily_spent()
        self.daily_spent = current + amount
        self.daily_spent_date = today
        self.save(update_fields=['daily_spent', 'daily_spent_date'])

    def __str__(self):
        return f"AppProfile({self.user.email})"


class OTPRequest(models.Model):
    """
    Short-lived one-time code for phone verification (register/login) and
    password reset.

    ponytail: no SMS gateway is wired in yet (no provider credentials were
    given) — `send()` just logs the code. In DEBUG, the code is echoed back
    in the API response so the app is testable end-to-end without SMS.
    Swap `send()` for a real provider (Twilio/MSG91/etc.) before production
    and delete the DEBUG echo in apps/mobile/auth/views.py.
    """
    PURPOSES = [('register', 'Register'), ('login', 'Login'), ('reset', 'Password Reset')]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone      = models.CharField(max_length=20, db_index=True)
    purpose    = models.CharField(max_length=20, choices=PURPOSES)
    code_hash  = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    consumed   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otp_requests'
        ordering = ['-created_at']

    @classmethod
    def issue(cls, phone, purpose, ttl_seconds=300):
        code = f"{random.randint(0, 9999):04d}"
        otp = cls.objects.create(
            phone=phone, purpose=purpose,
            code_hash=make_password(code),
            expires_at=timezone.now() + timedelta(seconds=ttl_seconds),
        )
        otp.send(code)
        return otp

    def send(self, code):
        # ponytail: no SMS provider configured — print it so the demo/dev
        # flow still works. Real send: replace this body with e.g. Twilio's
        # client.messages.create(...).
        #
        # Deliberately a plain print(), not logging.getLogger(...).info() —
        # this project's settings never define a LOGGING dict, so a custom
        # logger name has no handler attached and Python silently drops
        # anything below WARNING. print() always reaches runserver's
        # console no matter how (or whether) logging is configured.
        print(f'[ZORO OTP] {self.phone} ({self.purpose}): {code}')

    def verify(self, code):
        if self.consumed or timezone.now() > self.expires_at:
            return False
        if not check_password(code, self.code_hash):
            return False
        self.consumed = True
        self.save(update_fields=['consumed'])
        return True

    def __str__(self):
        return f"OTP({self.phone}, {self.purpose})"


class RecentContact(models.Model):
    """A quick-send list: the last people `owner` sent ZOR to."""
    owner      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_contacts')
    contact    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='+')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recent_contacts'
        unique_together = ('owner', 'contact')
        ordering = ['-updated_at']

    @classmethod
    def touch(cls, owner, contact):
        """Add/bump a contact to the top of the recent list."""
        obj, _ = cls.objects.update_or_create(owner=owner, contact=contact)
        return obj


class BankAccount(models.Model):
    """A bank account a user linked for (future) withdrawals to fiat."""
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bank_accounts')
    bank_name      = models.CharField(max_length=150)
    holder_name    = models.CharField(max_length=150)
    account_number = models.CharField(max_length=34)
    ifsc           = models.CharField(max_length=11)
    is_primary     = models.BooleanField(default=False)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bank_accounts'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.pk and not BankAccount.objects.filter(user=self.user).exists():
            self.is_primary = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.bank_name} — {self.user.email}"
