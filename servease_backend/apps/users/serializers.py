"""
Users Serializers
"""
from rest_framework import serializers
from .models import User, Address


class AddressSerializer(serializers.ModelSerializer):
    """Address serializer"""
    
    class Meta:
        model = Address
        fields = [
            'id', 'label', 'address_line', 'city', 'state', 'pincode',
            'landmark', 'latitude', 'longitude', 'is_primary',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
            'role', 'profile_image', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'pincode', 'country',
            'latitude', 'longitude', 'is_verified', 'is_active',
            'addresses', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'is_verified', 'is_active',
            'created_at', 'updated_at', 'addresses'
        ]