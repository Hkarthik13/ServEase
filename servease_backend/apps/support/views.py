"""
Support Views
"""
from rest_framework import generics, permissions
from .models import SupportTicket, TicketMessage, FAQ
from .serializers import SupportTicketSerializer, TicketMessageSerializer, FAQSerializer


class SupportTicketListView(generics.ListCreateAPIView):
    """List and create support tickets"""
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FAQListView(generics.ListAPIView):
    """List FAQs"""
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return FAQ.objects.filter(is_active=True)