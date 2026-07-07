from rest_framework import serializers
from .models import SystemLog

class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = ['id', 'log_id', 'actor', 'actor_label', 'action',
                  'category', 'severity', 'ip_address', 'status_code',
                  'metadata', 'created_at']
        read_only_fields = ('id', 'log_id', 'created_at')
