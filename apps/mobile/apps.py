from django.apps import AppConfig


class MobileConfig(AppConfig):
    """
    Registers apps/mobile. Its models.py only holds data with no admin-side
    equivalent (transaction PIN, OTP codes, recent contacts, bank accounts) —
    wallet balance, transactions, KYC, rewards, referrals etc. still come
    from apps.users / apps.wallets / apps.transactions / apps.kyc /
    apps.rewards / apps.referrals / apps.notifications directly.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.mobile'
    label = 'mobile_app'  # explicit label: avoids clashing with any 3rd-party "mobile" app label
    verbose_name = 'ZORO Mobile App API'
