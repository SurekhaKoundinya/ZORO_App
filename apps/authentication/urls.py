from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdminLoginView, LogoutView, TOTPSetupView,
    PasswordChangeView, APIKeyListCreateView, APIKeyDeleteView, MeView
)

urlpatterns = [
    path('login/',           AdminLoginView.as_view(),       name='auth-login'),
    path('logout/',          LogoutView.as_view(),            name='auth-logout'),
    path('refresh/',         TokenRefreshView.as_view(),      name='auth-refresh'),
    path('token/refresh/',   TokenRefreshView.as_view(),      name='auth-token-refresh'),
    path('me/',              MeView.as_view(),                name='auth-me'),
    path('2fa/setup/',       TOTPSetupView.as_view(),         name='auth-2fa'),
    path('change-password/', PasswordChangeView.as_view(),    name='auth-change-password'),
    path('api-keys/',        APIKeyListCreateView.as_view(),  name='auth-api-keys'),
    path('api-keys/<uuid:pk>/', APIKeyDeleteView.as_view(),   name='auth-api-key-delete'),
]
