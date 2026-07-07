from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    generated_by_email = serializers.ReadOnlyField(source='generated_by.email')
    class Meta:
        model = Report
        fields = ['id', 'name', 'report_type', 'format', 'status', 'period',
                  'file_url', 'file_size', 'row_count', 'generated_by',
                  'generated_by_email', 'created_at', 'completed_at']
        read_only_fields = ('id', 'status', 'file_url', 'file_size', 'row_count',
                            'generated_by', 'created_at', 'completed_at')

class ReportGenerateSerializer(serializers.Serializer):
    report_type = serializers.ChoiceField(choices=['revenue','users','transactions','kyc','wallets','referrals','custom'])
    format      = serializers.ChoiceField(choices=['csv','xlsx','pdf'], default='csv')
    period      = serializers.CharField(max_length=50, required=False, default='')
    date_from   = serializers.DateField(required=False)
    date_to     = serializers.DateField(required=False)
