from django.contrib import admin
from .models import Wallet
@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'network', 'currency', 'balance', 'status', 'risk_level')
    list_filter = ('status', 'risk_level', 'network')
    search_fields = ('address', 'owner__email')
