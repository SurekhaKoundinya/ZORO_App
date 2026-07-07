import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('role', 'super_admin')
        extra.setdefault('is_staff', True)
        extra.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('kyc_agent', 'KYC Agent'),
        ('support', 'Support'),
        ('user', 'User'),
    ]
    STATUS = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending'),
        ('banned', 'Banned'),
    ]
    KYC_LEVELS = [(0, 'None'), (1, 'Level 1'), (2, 'Level 2'), (3, 'Level 3')]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email       = models.EmailField(unique=True)
    first_name  = models.CharField(max_length=100, blank=True)
    last_name   = models.CharField(max_length=100, blank=True)
    avatar      = models.CharField(max_length=10, blank=True)   # initials e.g. "AM"
    country     = models.CharField(max_length=100, blank=True)
    phone       = models.CharField(max_length=30, blank=True)
    role        = models.CharField(max_length=20, choices=ROLES, default='user')
    status      = models.CharField(max_length=20, choices=STATUS, default='pending')
    kyc_level   = models.IntegerField(choices=KYC_LEVELS, default=0)
    risk_score  = models.IntegerField(default=0)
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    referred_by = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='referrals')

    # Auth flags
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    totp_secret = models.CharField(max_length=64, blank=True)
    totp_enabled = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email

    def save(self, *args, **kwargs):
        if not self.avatar and (self.first_name or self.last_name):
            self.avatar = (self.first_name[:1] + self.last_name[:1]).upper()
        if not self.referral_code:
            import random, string
            self.referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
