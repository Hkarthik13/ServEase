"""
Core Models for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class ActivityLog(models.Model):
    """Activity log for audit trail"""
    
    ACTION_TYPE = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('BOOKING', 'Booking'),
        ('PAYMENT', 'Payment'),
        ('REVIEW', 'Review'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Related objects
    related_id = models.PositiveIntegerField(null=True, blank=True)
    related_type = models.CharField(max_length=50, null=True, blank=True)
    
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_logs'
        verbose_name = _('Activity Log')
        verbose_name_plural = _('Activity Logs')
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action_type', 'created_at']),
            models.Index(fields=['related_type', 'related_id']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.created_at}"