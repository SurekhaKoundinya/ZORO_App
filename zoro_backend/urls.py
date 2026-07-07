from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Admin portal API v1 (unchanged) ───────────────────────────
    path('api/v1/auth/',          include('apps.authentication.urls')),
    path('api/v1/users/',         include('apps.users.urls')),
    path('api/v1/kyc/',           include('apps.kyc.urls')),
    path('api/v1/wallets/',       include('apps.wallets.urls')),
    path('api/v1/transactions/',  include('apps.transactions.urls')),
    path('api/v1/referrals/',     include('apps.referrals.urls')),
    path('api/v1/rewards/',       include('apps.rewards.urls')),
    path('api/v1/reports/',       include('apps.reports.urls')),
    path('api/v1/system-logs/',   include('apps.system_logs.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/dashboard/',     include('apps.dashboard.urls')),
    path('api/v1/settings/',      include('apps.settings_api.urls')),

    # ── Mobile app API v1 (new) ────────────────────────────────────
    # Own namespace so admin-facing and app-facing routes never collide, even
    # though they run in the same process against the same database.
    # NOTE: the mobile app also calls /api/v1/kyc/ and /api/v1/notifications/
    # directly (see apps/mobile/__init__.py for why those aren't remounted here).
    path('api/v1/app/',           include('apps.mobile.urls')),

    # Swagger / OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(),                     name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

if settings.DEBUG:
    try:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
    except ImportError:
        pass
