"""
Bookings Serializers
"""
from rest_framework import serializers
from .models import Booking, BookingStatusHistory
from apps.services.serializers import ServiceSerializer


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingStatusHistory
        fields = ['id', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True, default='')
    provider_business = serializers.CharField(source='provider.provider_profile.business_name', read_only=True, default='')
    category_name = serializers.CharField(source='category.name', read_only=True)
    address_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'customer', 'customer_name', 'provider', 'provider_name', 'provider_business',
            'service', 'service_details', 'category', 'category_name',
            'service_address', 'address_details', 'service_date', 'service_time', 'service_duration_minutes',
            'special_instructions', 'base_price', 'additional_charges', 'discount_amount',
            'coupon', 'tax_amount', 'total_amount', 'platform_fee', 'provider_amount',
            'status', 'payment_status', 'payment_method', 'is_rated', 'is_urgent',
            'accepted_at', 'started_at', 'completed_at', 'canceled_at',
            'status_history', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'booking_id', 'customer', 'provider', 'category', 
            'base_price', 'tax_amount', 'platform_fee', 'total_amount', 'provider_amount',
            'status', 'created_at', 'updated_at'
        ]
        
    def get_address_details(self, obj):
        if obj.service_address:
            return {
                'id': obj.service_address.id,
                'label': obj.service_address.label,
                'address_line': obj.service_address.address_line,
                'city': obj.service_address.city,
                'state': obj.service_address.state,
                'pincode': obj.service_address.pincode,
                'landmark': obj.service_address.landmark,
                'latitude': obj.service_address.latitude,
                'longitude': obj.service_address.longitude,
            }
        return None
