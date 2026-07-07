from rest_framework import serializers
from apps.rewards.models import Reward, RewardProgram


class AppRewardProgramSerializer(serializers.ModelSerializer):
    """Active campaigns a user can currently qualify for."""
    class Meta:
        model = RewardProgram
        fields = ['id', 'name', 'description', 'amount', 'currency']


class AppRewardSerializer(serializers.ModelSerializer):
    """
    Matches mockApi's reward shape exactly: { id, type, amount, status, date }.
    `type` is the reward program's name (e.g. "Referral Bonus", "Trading
    Reward") — RewardProgram already models this, no new field needed.
    """
    type = serializers.ReadOnlyField(source='program.name')
    date = serializers.SerializerMethodField()

    class Meta:
        model = Reward
        fields = ['id', 'type', 'amount', 'status', 'date']

    def get_date(self, obj):
        return obj.created_at.strftime('%b %d, %Y')
