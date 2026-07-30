"""
Analytics Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class DailyStats(models.Model):
    """Daily statistics tracking"""
    date = models.DateField(unique=True, db_index=True)
    
    # Users
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    total_providers = models.PositiveIntegerField(default=0)
    new_providers = models.PositiveIntegerField(default=0)
    
    # Bookings
    total_bookings = models.PositiveIntegerField(default=0)
    completed_bookings = models.PositiveIntegerField(default=0)
    canceled_bookings = models.PositiveIntegerField(default=0)
    
    # Revenue
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    platform_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    provider_payouts = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Services
    total_services = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_stats'
        verbose_name = _('Daily Stats')
        verbose_name_plural = _('Daily Stats')
        indexes = [
            models.Index(fields=['date']),
        ]
        ordering = ['-date']
    
    def __str__(self):
        return str(self.date)


class CategoryStats(models.Model):
    """Category-wise statistics"""
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, related_name='stats')
    date = models.DateField(db_index=True)
    
    bookings_count = models.PositiveIntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'category_stats'
        verbose_name = _('Category Stats')
        verbose_name_plural = _('Category Stats')
        unique_together = ['category', 'date']
        indexes = [
            models.Index(fields=['category', 'date']),
        ]
        ordering = ['-date']


class ProviderStats(models.Model):
    """Provider performance statistics"""
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_stats')
    date = models.DateField(db_index=True)
    
    bookings_received = models.PositiveIntegerField(default=0)
    bookings_completed = models.PositiveIntegerField(default=0)
    bookings_canceled = models.PositiveIntegerField(default=0)
    
    earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'provider_stats'
        verbose_name = _('Provider Stats')
        verbose_name_plural = _('Provider Stats')
        unique_together = ['provider', 'date']
        indexes = [
            models.Index(fields=['provider', 'date']),
        ]
        ordering = ['-date']


class SearchAnalytics(models.Model):
    """Track search queries"""
    query = models.CharField(max_length=200, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    results_count = models.PositiveIntegerField(default=0)
    clicked_service = models.ForeignKey('services.Service', on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'search_analytics'
        verbose_name = _('Search Analytics')
        verbose_name_plural = _('Search Analytics')
        indexes = [
            models.Index(fields=['query', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']