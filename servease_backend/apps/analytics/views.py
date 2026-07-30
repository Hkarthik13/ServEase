"""
Analytics Views
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import DailyStats, CategoryStats, ProviderStats, SearchAnalytics
from .serializers import DailyStatsSerializer, CategoryStatsSerializer


class AnalyticsStatsView(generics.GenericAPIView):
    """Get analytics statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Analytics stats'})