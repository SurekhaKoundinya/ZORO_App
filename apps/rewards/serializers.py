from rest_framework import serializers
from .models import Reward, RewardProgram


class RewardProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardProgram
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class RewardSerializer(serializers.ModelSerializer):
    user_name    = serializers.ReadOnlyField(source='user.full_name')
    user_email   = serializers.ReadOnlyField(source='user.email')
    user_avatar  = serializers.ReadOnlyField(source='user.avatar')
    program_name = serializers.ReadOnlyField(source='program.name')

    class Meta:
        model = Reward
        fields = [
            'id', 'user', 'user_name', 'user_email', 'user_avatar',
            'program', 'program_name', 'amount', 'status',
            'approved_by', 'created_at', 'paid_at',
        ]
        read_only_fields = ('id', 'approved_by', 'created_at', 'paid_at')
