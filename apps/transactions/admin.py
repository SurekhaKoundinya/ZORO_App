from django.contrib import admin
from .models import Transaction
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('tx_id', 'user', 'tx_type', 'amount', 'currency', 'status', 'network', 'created_at')
    list_filter = ('status', 'tx_type', 'network', 'currency')
    search_fields = ('tx_id', 'tx_hash', 'user__email')
