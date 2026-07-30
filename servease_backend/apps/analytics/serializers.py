"""
Analytics Serializers
"""
from rest_framework import serializers
from .models import DailyStats, CategoryStats, ProviderStats, SearchAnalytics


class DailyStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStats
        fields = ['id', 'date', 'total_bookings', 'total_revenue', 'total_users', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']


class CategoryStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryStats
        fields = ['id', 'category', 'date', 'booking_count', 'revenue', 'created_at']
        read_only_fields = ['id', 'date', 'created_at']