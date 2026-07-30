"""
Support Model for ServEase
"""
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class SupportTicket(models.Model):
    """Customer support tickets"""
    
    PRIORITY = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    )
    
    STATUS = (
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('WAITING_FOR_CUSTOMER', 'Waiting for Customer'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    )
    
    CATEGORY = (
        ('BOOKING_ISSUE', 'Booking Issue'),
        ('PAYMENT_ISSUE', 'Payment Issue'),
        ('SERVICE_QUALITY', 'Service Quality'),
        ('PROVIDER_ISSUE', 'Provider Issue'),
        ('TECHNICAL', 'Technical Issue'),
        ('REFUND_REQUEST', 'Refund Request'),
        ('OTHER', 'Other'),
    )
    
    ticket_id = models.CharField(max_length=20, unique=True, db_index=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tickets'
    )
    
    # Ticket Details
    subject = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY)
    priority = models.CharField(max_length=20, choices=PRIORITY, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS, default='OPEN')
    
    # Related objects
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='ticketed_providers')
    
    # Attachments
    attachments = models.JSONField(default=list, help_text=_('List of attachment URLs'))
    
    # Resolution
    resolution = models.TextField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'support_tickets'
        verbose_name = _('Support Ticket')
        verbose_name_plural = _('Support Tickets')
        indexes = [
            models.Index(fields=['ticket_id']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['status', 'priority']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.ticket_id} - {self.subject}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            import random
            random_num = random.randint(100000, 999999)
            self.ticket_id = f"TKT{random_num}"
        super().save(*args, **kwargs)


class TicketMessage(models.Model):
    """Messages within a support ticket"""
    
    SENDER_TYPE = (
        ('CUSTOMER', 'Customer'),
        ('SUPPORT', 'Support Agent'),
        ('SYSTEM', 'System'),
        ('PROVIDER', 'Provider'),
    )
    
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=20, choices=SENDER_TYPE)
    message = models.TextField()
    attachments = models.JSONField(default=list, help_text=_('List of attachment URLs'))
    is_internal = models.BooleanField(default=False, help_text=_('Internal note visible only to support team'))
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ticket_messages'
        verbose_name = _('Ticket Message')
        verbose_name_plural = _('Ticket Messages')
        indexes = [
            models.Index(fields=['ticket', 'created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.ticket.ticket_id} - Message {self.id}"


class FAQ(models.Model):
    """Frequently asked questions"""
    
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE, null=True, blank=True, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField()
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    view_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'faqs'
        verbose_name = _('FAQ')
        verbose_name_plural = _('FAQs')
        indexes = [
            models.Index(fields=['category', 'is_featured', 'sort_order']),
        ]
        ordering = ['sort_order', '-created_at']
    
    def __str__(self):
        return self.question


class ChatbotConversation(models.Model):
    """AI Chatbot conversations"""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chatbot_conversations', null=True, blank=True)
    session_id = models.CharField(max_length=100, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'chatbot_conversations'
        verbose_name = _('Chatbot Conversation')
        verbose_name_plural = _('Chatbot Conversations')
        indexes = [
            models.Index(fields=['session_id', 'is_active']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"Session {self.session_id}"


class ChatbotMessage(models.Model):
    """Chatbot messages"""
    
    SENDER_TYPE = (
        ('USER', 'User'),
        ('BOT', 'Bot'),
    )
    
    conversation = models.ForeignKey(ChatbotConversation, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPE)
    message = models.TextField()
    intent = models.CharField(max_length=100, null=True, blank=True)
    confidence = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chatbot_messages'
        verbose_name = _('Chatbot Message')
        verbose_name_plural = _('Chatbot Messages')
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.conversation.session_id} - {self.sender_type}"