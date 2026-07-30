"""
Notifications Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """In-app notifications"""
    
    NOTIFICATION_TYPE = (
        ('BOOKING_REQUEST', 'Booking Request'),
        ('BOOKING_ACCEPTED', 'Booking Accepted'),
        ('BOOKING_REJECTED', 'Booking Rejected'),
        ('BOOKING_CANCELLED', 'Booking Cancelled'),
        ('BOOKING_COMPLETED', 'Booking Completed'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('PAYMENT_FAILED', 'Payment Failed'),
        ('REVIEW_RECEIVED', 'Review Received'),
        ('PROVIDER_VERIFIED', 'Provider Verified'),
        ('PROVIDER_SUSPENDED', 'Provider Suspended'),
        ('WITHDRAWAL_APPROVED', 'Withdrawal Approved'),
        ('WITHDRAWAL_REJECTED', 'Withdrawal Rejected'),
        ('SYSTEM', 'System Notification'),
        ('PROMOTION', 'Promotion'),
    )
    
    CHANNEL = (
        ('IN_APP', 'In-App'),
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
    )
    
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE)
    channel = models.CharField(max_length=20, choices=CHANNEL, default='IN_APP')
    
    # Content
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, help_text=_('Additional data'))
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Related objects
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, null=True, blank=True)
    review = models.ForeignKey('reviews.Review', on_delete=models.CASCADE, null=True, blank=True)
    payment = models.ForeignKey('payments.Payment', on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        indexes = [
            models.Index(fields=['recipient', 'is_read', 'created_at']),
            models.Index(fields=['notification_type']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recipient.email} - {self.title}"
    
    def mark_as_read(self):
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class PushNotificationDevice(models.Model):
    """Store FCM device tokens"""
    DEVICE_TYPE = (
        ('ANDROID', 'Android'),
        ('IOS', 'iOS'),
        ('WEB', 'Web'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='devices')
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPE)
    device_token = models.CharField(max_length=255, db_index=True)
    device_id = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'push_notification_devices'
        verbose_name = _('Push Notification Device')
        verbose_name_plural = _('Push Notification Devices')
        unique_together = ['user', 'device_token']
        indexes = [
            models.Index(fields=['device_token', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.device_type}"


class EmailTemplate(models.Model):
    """Email templates for notifications"""
    
    TEMPLATE_TYPE = (
        ('WELCOME', 'Welcome Email'),
        ('OTP', 'OTP Email'),
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
        ('PAYMENT_RECEIPT', 'Payment Receipt'),
        ('REVIEW_REQUEST', 'Review Request'),
        ('PROVIDER_APPROVED', 'Provider Approved'),
        ('PASSWORD_RESET', 'Password Reset'),
    )
    
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE, unique=True)
    subject = models.CharField(max_length=200)
    body_html = models.TextField()
    body_text = models.TextField(null=True, blank=True)
    variables = models.JSONField(default=list, help_text=_('Available variables'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = _('Email Template')
        verbose_name_plural = _('Email Templates')
    
    def __str__(self):
        return self.subject


class SMSTemplate(models.Model):
    """SMS templates"""
    
    TEMPLATE_TYPE = (
        ('OTP', 'OTP SMS'),
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
        ('PAYMENT_RECEIPT', 'Payment Receipt'),
        ('PROVIDER_APPROVED', 'Provider Approved'),
    )
    
    template_type = models.CharField(max_length=30, choices=TEMPLATE_TYPE, unique=True)
    body = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sms_templates'
        verbose_name = _('SMS Template')
        verbose_name_plural = _('SMS Templates')
    
    def __str__(self):
        return self.template_type