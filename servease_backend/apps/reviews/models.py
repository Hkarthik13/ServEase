"""
Reviews Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """Service reviews and ratings"""
    
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, related_name='reviews')
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    
    # Rating
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Review Content
    title = models.CharField(max_length=200, null=True, blank=True)
    review = models.TextField(null=True, blank=True)
    
    # Photos
    photos = models.JSONField(default=list, help_text=_('List of review photo URLs'))
    
    # Service-specific ratings
    quality_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    punctuality_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    professionalism_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    value_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Provider Response
    provider_response = models.TextField(null=True, blank=True)
    provider_responded_at = models.DateTimeField(null=True, blank=True)
    
    # Status
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.CharField(max_length=200, null=True, blank=True)
    
    # Helpful
    helpful_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        indexes = [
            models.Index(fields=['provider', 'is_approved', 'created_at']),
            models.Index(fields=['service', 'is_approved']),
            models.Index(fields=['customer', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.full_name} - {self.service.name}"


class ReviewHelpful(models.Model):
    """Track helpful votes on reviews"""
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'review_helpful'
        verbose_name = _('Review Helpful')
        verbose_name_plural = _('Review Helpful')
        unique_together = ['review', 'user']
        indexes = [
            models.Index(fields=['review', 'user']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.review.id}"
