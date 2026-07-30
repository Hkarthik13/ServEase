"""
Support Serializers
"""
from rest_framework import serializers
from .models import SupportTicket, TicketMessage, FAQ


class TicketMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_id', 'user', 'subject', 'description', 'category',
            'priority', 'status', 'assigned_to', 'resolved_at',
            'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ticket_id', 'user', 'created_at', 'updated_at']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']