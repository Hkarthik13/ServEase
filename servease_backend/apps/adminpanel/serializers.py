"""
Admin Panel Serializers
"""
from rest_framework import serializers


class AdminDashboardSerializer(serializers.Serializer):
    """Admin dashboard serializer"""
    total_users = serializers.IntegerField()
    total_providers = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_verifications = serializers.IntegerField()
    open_tickets = serializers.IntegerField()