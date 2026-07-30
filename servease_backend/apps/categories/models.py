"""
Service Categories Model
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Category(models.Model):
    """Service categories like Electrician, Plumber, etc."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=50, null=True, blank=True, help_text=_('Icon name'))
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    
    # Hierarchy
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    
    # Display
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    
    # Meta
    meta_title = models.CharField(max_length=200, null=True, blank=True)
    meta_description = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        indexes = [
            models.Index(fields=['slug', 'is_active']),
            models.Index(fields=['is_featured', 'sort_order']),
        ]
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class ServiceImage(models.Model):
    """Images for services"""
    image = models.ImageField(upload_to='services/')
    caption = models.CharField(max_length=200, null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'service_images'
        verbose_name = _('Service Image')
        verbose_name_plural = _('Service Images')
        ordering = ['sort_order']
    
    def __str__(self):
        return f"Image {self.id}"