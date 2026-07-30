"""
Bookings Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class Booking(models.Model):
    """Main booking model"""
    
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('ON_THE_WAY', 'Provider On the Way'),
        ('ARRIVED', 'Provider Arrived'),
        ('IN_PROGRESS', 'Service In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLELED_BY_CUSTOMER', 'Canceled by Customer'),
        ('CANCELLELED_BY_PROVIDER', 'Canceled by Provider'),
        ('CANCELLELED_BY_ADMIN', 'Canceled by Admin'),
        ('REFUNDED', 'Refunded'),
    )
    
    PAYMENT_STATUS = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
        ('PARTIALLY_REFUNDED', 'Partially Refunded'),
    )
    
    PAYMENT_METHOD = (
        ('UPI', 'UPI'),
        ('CARD', 'Credit/Debit Card'),
        ('NET_BANKING', 'Net Banking'),
        ('WALLET', 'Wallet'),
        ('CASH', 'Cash'),
        ('RAZORPAY', 'Razorpay'),
        ('STRIPE', 'Stripe'),
    )
    
    # Primary Participants
    booking_id = models.CharField(max_length=20, unique=True, db_index=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='provider_bookings',
        null=True,
        blank=True
    )
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='bookings')
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    
    # Service Details
    service_address = models.ForeignKey('users.Address', on_delete=models.SET_NULL, null=True)
    service_date = models.DateField()
    service_time = models.TimeField()
    service_duration_minutes = models.PositiveIntegerField(default=60)
    special_instructions = models.TextField(null=True, blank=True)
    
    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    additional_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon = models.ForeignKey('payments.Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    provider_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS, default='PENDING')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD, null=True, blank=True)
    
    # Tracking
    is_rated = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # Timeline
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    canceled_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = _('Booking')
        verbose_name_plural = _('Bookings')
        indexes = [
            models.Index(fields=['booking_id']),
            models.Index(fields=['customer', 'status', 'service_date']),
            models.Index(fields=['provider', 'status', 'service_date']),
            models.Index(fields=['service', 'service_date', 'service_time']),
            models.Index(fields=['status', 'payment_status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return self.booking_id
    
    def save(self, *args, **kwargs):
        if not self.booking_id:
            # Generate booking ID: SE + timestamp + random
            import random
            timestamp = str(int(self.created_at.timestamp() * 1000)) if self.created_at else str(int(time.time() * 1000))
            random_num = random.randint(1000, 9999)
            self.booking_id = f"SE{timestamp[-8:]}{random_num}"
        super().save(*args, **kwargs)


class BookingStatusHistory(models.Model):
    """Track booking status changes"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30, choices=Booking.STATUS_CHOICES)
    notes = models.TextField(null=True, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_status_history'
        verbose_name = _('Booking Status History')
        verbose_name_plural = _('Booking Status Histories')
        indexes = [
            models.Index(fields=['booking', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.booking.booking_id} - {self.status}"


class BookingConflict(models.Model):
    """Track booking conflicts"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='conflicts')
    conflicting_booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='conflicted_by')
    reason = models.TextField()
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_conflicts'
        verbose_name = _('Booking Conflict')
        verbose_name_plural = _('Booking Conflicts')
        indexes = [
            models.Index(fields=['booking', 'resolved']),
            models.Index(fields=['conflicting_booking', 'resolved']),
        ]


import time