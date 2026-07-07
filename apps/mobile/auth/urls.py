from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

# Reused directly from the admin auth app — no reason to reimplement these.
from apps.authentication.views import LogoutView, PasswordChangeView

from .views import (
    SendOtpView, VerifyOtpView, AppLoginView, ProfileView, SetPinView,
    VerifyResetOtpView, ResetPasswordView,
)

urlpatterns = [
    path('send-otp/',                  SendOtpView.as_view(),          name='app-auth-send-otp'),
    path('verify-otp/',                VerifyOtpView.as_view(),        name='app-auth-verify-otp'),
    path('login/',                     AppLoginView.as_view(),         name='app-auth-login'),
    path('refresh/',                   TokenRefreshView.as_view(),     name='app-auth-refresh'),
    path('logout/',                    LogoutView.as_view(),           name='app-auth-logout'),
    path('profile/',                   ProfileView.as_view(),          name='app-auth-profile'),
    path('set-pin/',                   SetPinView.as_view(),           name='app-auth-set-pin'),
    path('change-password/',           PasswordChangeView.as_view(),   name='app-auth-change-password'),
    path('send-password-reset-otp/',   SendOtpView.as_view(),          name='app-auth-send-reset-otp'),
    path('verify-password-reset-otp/', VerifyResetOtpView.as_view(),   name='app-auth-verify-reset-otp'),
    path('reset-password/',            ResetPasswordView.as_view(),    name='app-auth-reset-password'),
]
