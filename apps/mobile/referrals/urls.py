from django.urls import path
from .views import ReferralDataView

urlpatterns = [
    path('', ReferralDataView.as_view(), name='app-referrals'),
]
