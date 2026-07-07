from rest_framework import serializers
from .models import Referral
class ReferralSerializer(serializers.ModelSerializer):
    referrer_email = serializers.ReadOnlyField(source='referrer.email')
    referee_email  = serializers.ReadOnlyField(source='referee.email')
    class Meta:
        model = Referral
        fields = '__all__'
