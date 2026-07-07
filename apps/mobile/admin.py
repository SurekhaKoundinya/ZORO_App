from django.contrib import admin
from .models import AppProfile, OTPRequest, RecentContact, BankAccount


@admin.register(AppProfile)
class AppProfileAdmin(admin.ModelAdmin):
    """Support/ops visibility only — PIN itself is never shown (it's hashed)."""
    list_display = ('user', 'daily_limit', 'daily_spent', 'daily_spent_date', 'has_pin')
    search_fields = ('user__email', 'user__phone')
    readonly_fields = ('pin_hash',)

    def has_pin(self, obj):
        return bool(obj.pin_hash)
    has_pin.boolean = True


@admin.register(OTPRequest)
class OTPRequestAdmin(admin.ModelAdmin):
    list_display = ('phone', 'purpose', 'consumed', 'expires_at', 'created_at')
    list_filter = ('purpose', 'consumed')
    search_fields = ('phone',)
    readonly_fields = ('code_hash',)


@admin.register(RecentContact)
class RecentContactAdmin(admin.ModelAdmin):
    list_display = ('owner', 'contact', 'updated_at')
    search_fields = ('owner__email', 'contact__email')


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'bank_name', 'holder_name', 'is_primary', 'created_at')
    search_fields = ('user__email', 'bank_name', 'holder_name', 'account_number')
