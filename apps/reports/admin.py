from django.contrib import admin
from .models import Report
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'report_type', 'format', 'generated_by', 'period', 'created_at')
    list_filter = ('report_type', 'format')
