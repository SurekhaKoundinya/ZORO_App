from django.urls import path
from .views import AppDashboardView

urlpatterns = [
    path('', AppDashboardView.as_view(), name='app-dashboard'),
]
