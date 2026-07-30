"""
Providers Serializers
"""
from rest_framework import serializers
from .models import Provider, ProviderDocument, ProviderAvailability, ProviderGallery, ProviderBreak


class ProviderAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderAvailability
        fields = [
            'id', 'day_of_week', 'start_time', 'end_time', 'is_available'
        ]
        read_only_fields = ['id']


class ProviderDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderDocument
        fields = [
            'id', 'document_type', 'document_number', 'document_file',
            'is_verified', 'verified_at', 'notes', 'uploaded_at'
        ]
        read_only_fields = ['id', 'is_verified', 'verified_at', 'uploaded_at']


class ProviderGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderGallery
        fields = ['id', 'image', 'caption', 'sort_order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProviderBreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderBreak
        fields = ['id', 'date', 'start_time', 'end_time', 'reason']
        read_only_fields = ['id']


class ProviderSerializer(serializers.ModelSerializer):
    documents = ProviderDocumentSerializer(many=True, read_only=True)
    availabilities = ProviderAvailabilitySerializer(many=True, read_only=True)
    gallery = ProviderGallerySerializer(many=True, read_only=True)
    provider_name = serializers.CharField(source='user.full_name', read_only=True)
    provider_email = serializers.CharField(source='user.email', read_only=True)
    provider_phone = serializers.CharField(source='user.phone', read_only=True)
    
    class Meta:
        model = Provider
        fields = [
            'id', 'user', 'provider_name', 'provider_email', 'provider_phone',
            'business_name', 'business_description', 'gst_number', 'pan_number',
            'service_radius', 'years_of_experience', 'team_size', 'minimum_charge',
            'hourly_rate', 'verification_status', 'verification_notes', 'verified_at',
            'total_jobs', 'total_earnings', 'average_rating', 'total_reviews',
            'languages', 'is_available', 'is_featured', 'documents', 'availabilities',
            'gallery', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']