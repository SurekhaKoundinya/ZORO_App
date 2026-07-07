"""
Root URL map for the mobile app API — included at /api/v1/app/ (see
zoro_backend/urls.py). See apps/mobile/__init__.py for why KYC and
Notifications aren't listed here (the app calls the admin backend's
existing /api/v1/kyc/ and /api/v1/notifications/ endpoints directly).
"""

from django.urls import path, include

urlpatterns = [
    path('auth/',           include('apps.mobile.auth.urls')),
    path('wallets/',        include('apps.mobile.wallets.urls')),
    path('transactions/',   include('apps.mobile.transactions.urls')),
    path('rewards/',        include('apps.mobile.rewards.urls')),
    path('referrals/',      include('apps.mobile.referrals.urls')),
    path('market/',         include('apps.mobile.market.urls')),
    path('bank-accounts/',  include('apps.mobile.bank.urls')),
    path('dashboard/',      include('apps.mobile.dashboard.urls')),
]
