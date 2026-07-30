"""
Services Serializers
"""
from rest_framework import serializers
from .models import Service, ServiceFeature, ServiceFAQ, ServiceImage
from apps.categories.models import Category


class ServiceFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceFeature
        fields = ['id', 'name', 'description', 'icon', 'sort_order']
        read_only_fields = ['id']


class ServiceFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceFAQ
        fields = ['id', 'question', 'answer', 'sort_order']
        read_only_fields = ['id']


class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'is_primary', 'sort_order']
        read_only_fields = ['id']


class ServiceSerializer(serializers.ModelSerializer):
    features_list = ServiceFeatureSerializer(many=True, read_only=True)
    faqs = ServiceFAQSerializer(many=True, read_only=True)
    images = ServiceImageSerializer(many=True, read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    provider_business = serializers.CharField(source='provider.provider_profile.business_name', default='', read_only=True)
    provider_rating = serializers.DecimalField(source='provider.provider_profile.average_rating', max_digits=3, decimal_places=2, read_only=True, default=0.0)
    provider_latitude = serializers.DecimalField(source='provider.latitude', max_digits=9, decimal_places=6, read_only=True)
    provider_longitude = serializers.DecimalField(source='provider.longitude', max_digits=9, decimal_places=6, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_name', 'provider', 'provider_name', 'provider_business', 'provider_rating',
            'provider_latitude', 'provider_longitude',
            'name', 'slug', 'description', 'short_description',
            'pricing_type', 'base_price', 'hourly_rate', 'price_range_min', 'price_range_max',
            'duration_minutes', 'includes_materials', 'warranty_months',
            'tags', 'features', 'is_popular', 'is_featured', 'thumbnail', 'is_active',
            'features_list', 'faqs', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'provider', 'slug', 'created_at', 'updated_at']


class CategorySerializer(serializers.ModelSerializer):
    services_count = serializers.IntegerField(read_only=True, default=0)
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'icon',
            'is_active', 'services_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'services_count', 'created_at', 'updated_at']
