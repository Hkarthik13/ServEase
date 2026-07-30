"""
Reviews Views
"""
from rest_framework import generics, permissions, serializers
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    """List and create reviews"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(customer=self.request.user)
        
    def perform_create(self, serializer):
        booking = serializer.validated_data.get('booking')
        
        if booking.customer != self.request.user:
            raise serializers.ValidationError("You can only review your own bookings.")
            
        serializer.save(
            customer=self.request.user,
            provider=booking.provider,
            service=booking.service,
            category=booking.service.category
        )
        
        booking.is_rated = True
        booking.save()
        
        # Recalculate provider average rating
        try:
            provider = booking.provider
            provider_profile = provider.provider_profile
            reviews = Review.objects.filter(provider=provider, is_approved=True)
            total_rating = sum([r.rating for r in reviews]) + serializer.validated_data.get('rating')
            count = reviews.count() + 1
            provider_profile.average_rating = round(total_rating / count, 2)
            provider_profile.total_reviews = count
            provider_profile.save()
        except Exception:
            pass


class ReviewDetailView(generics.RetrieveAPIView):
    """Get review details"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(customer=self.request.user)