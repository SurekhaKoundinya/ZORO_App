from rest_framework import serializers
from apps.mobile.models import BankAccount


class BankAccountSerializer(serializers.ModelSerializer):
    """Field names match AddBankAccountScreen's payload/mockApi's stored shape exactly."""
    bankName = serializers.CharField(source='bank_name')
    holderName = serializers.CharField(source='holder_name')
    accountNumber = serializers.CharField(source='account_number')
    ifsc = serializers.CharField()
    primary = serializers.BooleanField(source='is_primary', read_only=True)

    class Meta:
        model = BankAccount
        fields = ['id', 'bankName', 'holderName', 'accountNumber', 'ifsc', 'primary', 'created_at']
        read_only_fields = ['id', 'created_at']
