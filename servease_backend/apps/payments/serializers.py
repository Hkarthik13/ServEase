"""
Payments Serializers
"""
from rest_framework import serializers
from .models import Payment, Wallet, WalletTransaction, Coupon


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'customer', 'provider', 'booking', 'amount', 'currency',
            'payment_method', 'gateway', 'gateway_order_id', 'gateway_payment_id',
            'gateway_signature', 'status', 'failure_reason', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_id', 'customer', 'created_at', 'updated_at']


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'wallet', 'transaction_type', 'amount', 'balance_after',
            'description', 'reference_id', 'booking', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'user', 'balance', 'transactions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'balance', 'created_at', 'updated_at']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'minimum_amount', 'maximum_discount', 'usage_limit', 'usage_count',
            'per_user_limit', 'new_users_only', 'valid_from', 'valid_until',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']