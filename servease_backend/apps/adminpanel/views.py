from rest_framework import generics, permissions, status
from rest_framework.response import Response
from apps.users.models import User
from apps.providers.models import Provider
from apps.bookings.models import Booking
from apps.support.models import SupportTicket
from apps.users.serializers import UserProfileSerializer
from django.db.models import Sum
from .serializers import AdminDashboardSerializer


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class AdminDashboardView(generics.GenericAPIView):
    """Admin dashboard metrics"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminDashboardSerializer
    
    def get(self, request):
        total_users = User.objects.filter(role='CUSTOMER').count()
        total_providers = Provider.objects.count()
        total_bookings = Booking.objects.count()
        
        # Calculate platform revenue
        completed_bookings = Booking.objects.filter(status='COMPLETED')
        platform_fee_sum = completed_bookings.aggregate(Sum('platform_fee'))['platform_fee__sum'] or 0.00
        tax_sum = completed_bookings.aggregate(Sum('tax_amount'))['tax_amount__sum'] or 0.00
        total_revenue = float(platform_fee_sum) + float(tax_sum)
        
        pending_verifications = Provider.objects.filter(verification_status='PENDING').count()
        
        try:
            open_tickets = SupportTicket.objects.filter(status='OPEN').count()
        except Exception:
            open_tickets = 0
            
        data = {
            'total_users': total_users,
            'total_providers': total_providers,
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'pending_verifications': pending_verifications,
            'open_tickets': open_tickets
        }
        
        serializer = self.get_serializer(data)
        return Response(serializer.data)


class AdminUserListView(generics.ListAPIView):
    """List all users for admin"""
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]


class AdminUserToggleActiveView(generics.GenericAPIView):
    """Toggle user active status"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Cannot toggle yourself
            if user == request.user:
                return Response({'error': 'You cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = not user.is_active
            user.save()
            return Response({
                'id': user.id,
                'email': user.email,
                'is_active': user.is_active,
                'message': f"User account has been {'activated' if user.is_active else 'deactivated'}."
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)