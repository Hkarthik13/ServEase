"""
Users Views
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from .models import Address
from .serializers import AddressSerializer, UserProfileSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get/Update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class AddressListView(generics.ListCreateAPIView):
    """List and create addresses"""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, delete address"""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class SetPrimaryAddressView(generics.UpdateAPIView):
    """Set address as primary"""
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        address = self.get_object()
        if address.user != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        Address.objects.filter(user=request.user, is_primary=True).update(is_primary=False)
        address.is_primary = True
        address.save()
        
        return Response({'message': 'Primary address updated'})
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)