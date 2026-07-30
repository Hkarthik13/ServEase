"""
Providers Views
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from .models import Provider, ProviderDocument, ProviderAvailability
from .serializers import ProviderSerializer, ProviderDocumentSerializer, ProviderAvailabilitySerializer


class ProviderListCreateView(generics.ListCreateAPIView):
    """List and create providers"""
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProviderDetailView(generics.RetrieveUpdateAPIView):
    """Get/Update provider details"""
    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProviderDashboardView(generics.GenericAPIView):
    """Provider dashboard"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'message': 'Provider Dashboard'})


class ProviderProfileView(generics.RetrieveUpdateAPIView):
    """Provider profile"""
    serializer_class = ProviderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.provider_profile


class ProviderDocumentListView(generics.ListCreateAPIView):
    """List and upload documents"""
    serializer_class = ProviderDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProviderDocument.objects.filter(provider=self.request.user.provider_profile)


class ProviderAvailabilityView(generics.ListCreateAPIView):
    """Manage availability"""
    serializer_class = ProviderAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ProviderAvailability.objects.filter(provider=self.request.user.provider_profile)