from django.contrib import admin
from .models import APIKey, LoginAttempt

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'prefix', 'is_active', 'created_at', 'last_used')
    list_filter = ('is_active',)
    search_fields = ('name', 'user__email')

@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'ip_address', 'success', 'created_at')
    list_filter = ('success',)
