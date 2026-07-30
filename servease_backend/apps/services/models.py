"""
Services Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Service(models.Model):
    """Service offerings"""
    
    PRICING_TYPE = (
        ('FIXED', 'Fixed Price'),
        ('HOURLY', 'Hourly Rate'),
        ('CUSTOM', 'Custom Quote'),
    )
    
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, related_name='services')
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='services_offered')
    
    # Service Details
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, null=True, blank=True)
    
    # Pricing
    pricing_type = models.CharField(max_length=20, choices=PRICING_TYPE, default='FIXED')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_range_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_range_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Details
    duration_minutes = models.PositiveIntegerField(default=60, help_text=_('Estimated service duration'))
    includes_materials = models.BooleanField(default=False)
    warranty_months = models.PositiveIntegerField(default=0)
    
    # Tags & Features
    tags = models.JSONField(default=list, help_text=_('Search tags'))
    features = models.JSONField(default=list, help_text=_('Service features'))
    is_popular = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # Media
    thumbnail = models.ImageField(upload_to='services/thumbnails/', null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Meta
    meta_title = models.CharField(max_length=200, null=True, blank=True)
    meta_description = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        verbose_name = _('Service')
        verbose_name_plural = _('Services')
        indexes = [
            models.Index(fields=['category', 'is_active', 'is_popular']),
            models.Index(fields=['provider', 'is_active']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_featured', 'created_at']),
        ]
        unique_together = ['provider', 'slug']
    
    def __str__(self):
        return self.name
    
    @property
    def rating(self):
        reviews = self.reviews.filter(is_approved=True)
        if reviews.count() == 0:
            return 0
        return round(sum([r.rating for r in reviews]) / reviews.count(), 2)


class ServiceFeature(models.Model):
    """Service features"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='features_list')
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=300, null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'service_features'
        verbose_name = _('Service Feature')
        verbose_name_plural = _('Service Features')
        ordering = ['sort_order']
    
    def __str__(self):
        return f"{self.service.name} - {self.name}"


class ServiceFAQ(models.Model):
    """Service FAQ"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'service_faqs'
        verbose_name = _('Service FAQ')
        verbose_name_plural = _('Service FAQs')
        ordering = ['sort_order']
    
    def __str__(self):
        return self.question


class ServiceImage(models.Model):
    """Service images"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='services/images/', null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'service_images_services'
        verbose_name = _('Service Image')
        verbose_name_plural = _('Service Images')
        ordering = ['sort_order']
    
    def __str__(self):
        return f"{self.service.name} - Image {self.id}"
