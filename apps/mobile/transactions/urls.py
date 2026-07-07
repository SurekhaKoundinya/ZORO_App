from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AppTransactionViewSet, TransferPreviewView, TransferView,
    UserByAddressView, ScanQrView, RecentsView,
)

router = DefaultRouter()
router.register('', AppTransactionViewSet, basename='app-transactions')

urlpatterns = [
    # Explicit routes first — the '' viewset's detail route (^(?P<tx_id>...)/$)
    # would otherwise swallow these as a tx_id lookup (see rewards/urls.py).
    path('preview/',          TransferPreviewView.as_view(), name='app-transfer-preview'),
    path('transfer/',         TransferView.as_view(),        name='app-transfer'),
    path('user-by-address/',  UserByAddressView.as_view(),   name='app-user-by-address'),
    path('scan-qr/',          ScanQrView.as_view(),           name='app-scan-qr'),
    path('recents/',          RecentsView.as_view(),          name='app-recents'),
] + router.urls
