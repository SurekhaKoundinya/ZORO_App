from django.urls import path
from .views import (
    ProfileView, PasswordChangeView,
    RoleListView, RoleUpdateView, PlatformSettingsView
)

urlpatterns = [
    path('profile/',              ProfileView.as_view(),         name='settings-profile'),
    path('change-password/',      PasswordChangeView.as_view(),  name='settings-password'),
    path('roles/',                RoleListView.as_view(),        name='settings-roles'),
    path('roles/<uuid:pk>/',      RoleUpdateView.as_view(),      name='settings-role-update'),
    path('platform/',             PlatformSettingsView.as_view(),name='settings-platform'),
]
