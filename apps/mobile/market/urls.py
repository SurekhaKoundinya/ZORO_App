from django.urls import path
from .views import MarketOverviewView

urlpatterns = [
    path('', MarketOverviewView.as_view(), name='app-market'),
]
