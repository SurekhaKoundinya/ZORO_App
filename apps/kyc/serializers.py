from rest_framework import serializers
from .models import KYCRequest, KYCDocument


class KYCDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCDocument
        fields = ('id', 'doc_type', 'liveness_passed', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class KYCRequestListSerializer(serializers.ModelSerializer):
    """Lightweight shape for the left-hand request list panel."""
    user_name     = serializers.ReadOnlyField(source='user.full_name')
    user_email    = serializers.ReadOnlyField(source='user.email')
    user_avatar   = serializers.ReadOnlyField(source='user.avatar')
    user_country  = serializers.ReadOnlyField(source='user.country')
    risk_score    = serializers.ReadOnlyField(source='user.risk_score')
    document_types = serializers.SerializerMethodField()

    class Meta:
        model = KYCRequest
        fields = ('id', 'user', 'user_name', 'user_email', 'user_avatar', 'user_country',
                  'risk_score', 'level', 'status', 'document_types', 'submitted_at')

    def get_document_types(self, obj):
        return list(obj.documents.values_list('doc_type', flat=True))


class KYCRequestDetailSerializer(serializers.ModelSerializer):
    """Full shape for the right-hand review panel."""
    user_name     = serializers.ReadOnlyField(source='user.full_name')
    user_email    = serializers.ReadOnlyField(source='user.email')
    user_avatar   = serializers.ReadOnlyField(source='user.avatar')
    user_country  = serializers.ReadOnlyField(source='user.country')
    risk_score    = serializers.ReadOnlyField(source='user.risk_score')
    reviewer_name = serializers.ReadOnlyField(source='reviewer.full_name')
    documents     = KYCDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = KYCRequest
        fields = ('id', 'user', 'user_name', 'user_email', 'user_avatar', 'user_country', 'risk_score',
                  'level', 'status', 'notes', 'documents', 'reviewer', 'reviewer_name',
                  'submitted_at', 'reviewed_at')
        read_only_fields = ('id', 'user', 'submitted_at', 'reviewed_at', 'reviewer')


class KYCRejectSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, allow_blank=False, max_length=1000)


class KYCResubmitSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)