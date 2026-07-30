"""
Provider Model for ServEase
Handles service provider profiles, documents, and availability
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Provider(models.Model):
    """Service Provider Profile"""
    
    VERIFICATION_STATUS = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_profile')
    
    # Business Details
    business_name = models.CharField(max_length=200)
    business_description = models.TextField(null=True, blank=True)
    gst_number = models.CharField(max_length=15, null=True, blank=True)
    pan_number = models.CharField(max_length=10, null=True, blank=True)
    
    # Service Details
    service_radius = models.PositiveIntegerField(default=10, help_text=_('Service radius in km'))
    years_of_experience = models.PositiveIntegerField(default=0)
    team_size = models.PositiveIntegerField(default=1)
    
    # Pricing
    minimum_charge = models.DecimalField(max_digits=10, decimal_places=2, default=99.00)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Verification
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='PENDING')
    verification_notes = models.TextField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_providers'
    )
    
    # Stats
    total_jobs = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    
    # Language
    languages = models.JSONField(default=list, help_text=_('List of languages spoken'))
    
    # Bank Details
    bank_account_number = models.CharField(max_length=20, null=True, blank=True)
    bank_ifsc_code = models.CharField(max_length=11, null=True, blank=True)
    bank_account_holder = models.CharField(max_length=100, null=True, blank=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'providers'
        verbose_name = _('Provider')
        verbose_name_plural = _('Providers')
        indexes = [
            models.Index(fields=['verification_status', 'is_available']),
            models.Index(fields=['average_rating', 'total_jobs']),
            models.Index(fields=['is_featured', 'average_rating']),
        ]
    
    def __str__(self):
        return self.business_name
    
    @property
    def completion_rate(self):
        if self.total_jobs == 0:
            return 0
        return round((self.total_jobs / max(self.total_jobs, 1)) * 100, 2)


class ProviderDocument(models.Model):
    """Provider verification documents"""
    
    DOCUMENT_TYPE = (
        ('AADHAR', 'Aadhar Card'),
        ('PAN', 'PAN Card'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('VOTER_ID', 'Voter ID'),
        ('PASSPORT', 'Passport'),
        ('BANK_PASSBOOK', 'Bank Passbook'),
        ('BUSINESS_LICENSE', 'Business License'),
        ('OTHER', 'Other'),
    )
    
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPE)
    document_number = models.CharField(max_length=50)
    document_file = models.FileField(upload_to='providers/documents/')
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'provider_documents'
        verbose_name = _('Provider Document')
        verbose_name_plural = _('Provider Documents')
        indexes = [
            models.Index(fields=['provider', 'document_type']),
        ]
    
    def __str__(self):
        return f"{self.provider.business_name} - {self.document_type}"


class ProviderGallery(models.Model):
    """Provider portfolio/work gallery"""
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='providers/gallery/')
    caption = models.CharField(max_length=200, null=True, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'provider_gallery'
        verbose_name = _('Provider Gallery')
        verbose_name_plural = _('Provider Galleries')
        ordering = ['sort_order']
    
    def __str__(self):
        return f"{self.provider.business_name} - Image {self.id}"


class ProviderAvailability(models.Model):
    """Provider availability schedule"""
    
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )
    
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'provider_availability'
        verbose_name = _('Provider Availability')
        verbose_name_plural = _('Provider Availabilities')
        unique_together = ['provider', 'day_of_week']
        indexes = [
            models.Index(fields=['provider', 'day_of_week', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.provider.business_name} - {self.get_day_of_week_display()}"


class ProviderBreak(models.Model):
    """Provider break times"""
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='breaks')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=200, null=True, blank=True)
    
    class Meta:
        db_table = 'provider_breaks'
        verbose_name = _('Provider Break')
        verbose_name_plural = _('Provider Breaks')
        indexes = [
            models.Index(fields=['provider', 'date']),
        ]
    
    def __str__(self):
        return f"{self.provider.business_name} - {self.date} Break"