"""
Reviews Serializers
"""
from rest_framework import serializers
from .models import Review, ReviewHelpful


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'review', 'user', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'customer', 'provider', 'service', 'category',
            'rating', 'title', 'review', 'photos',
            'quality_rating', 'punctuality_rating', 'professionalism_rating', 'value_rating',
            'provider_response', 'is_approved', 'helpful_count', 'created_at'
        ]
        read_only_fields = ['id', 'customer', 'provider', 'created_at']