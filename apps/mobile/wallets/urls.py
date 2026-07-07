from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AppWalletViewSet, WalletDashboardView, WalletAddressView

router = DefaultRouter()
router.register('', AppWalletViewSet, basename='app-wallets')

urlpatterns = [
    # Listed before router.urls — see rewards/urls.py for why order matters here.
    path('dashboard/', WalletDashboardView.as_view(), name='app-wallet-dashboard'),
    path('address/',   WalletAddressView.as_view(),   name='app-wallet-address'),
] + router.urls
