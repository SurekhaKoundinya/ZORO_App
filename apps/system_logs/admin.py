from django.contrib import admin
from .models import SystemLog
@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('log_id', 'category', 'severity', 'actor', 'action', 'status_code', 'created_at')
    list_filter = ('severity', 'category')
    search_fields = ('action', 'actor__email', 'ip_address')
    readonly_fields = ('log_id', 'created_at')
