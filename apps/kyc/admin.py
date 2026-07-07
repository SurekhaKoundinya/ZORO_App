from django.contrib import admin
from .models import KYCRequest, KYCDocument


class KYCDocumentInline(admin.TabularInline):
    model = KYCDocument
    extra = 0
    readonly_fields = ('id', 'uploaded_at')


@admin.register(KYCRequest)
class KYCRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'level', 'status', 'submitted_at', 'reviewed_at')
    list_filter = ('status', 'level')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('id', 'submitted_at')
    inlines = [KYCDocumentInline]


@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'kyc_request', 'doc_type', 'liveness_passed', 'uploaded_at')
    list_filter = ('doc_type', 'liveness_passed')
