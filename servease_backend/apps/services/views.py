"""
Services Views
"""
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Service
from .serializers import ServiceSerializer
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from .ai_utils import analyze_image, detect_issue, estimate_for_service, is_emergency, provider_match_score


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ServiceListView(generics.ListCreateAPIView):
    """List and create services"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    filter_fields = ['category', 'provider', 'is_active']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        from django.utils.text import slugify
        name = serializer.validated_data.get('name')
        slug = slugify(name)
        
        # Deduplicate slug per provider
        original_slug = slug
        count = 1
        while Service.objects.filter(provider=self.request.user, slug=slug).exists():
            slug = f"{original_slug}-{count}"
            count += 1
            
        serializer.save(provider=self.request.user, slug=slug)


class ServiceDetailView(generics.RetrieveAPIView):
    """Get service details"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class AIServiceAssistantView(APIView):
    """Suggest service, estimate cost, and detect priority from a customer issue."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        issue = request.data.get('issue', '').strip()
        area = request.data.get('area', '').strip()
        customer_latitude = request.data.get('customer_latitude')
        customer_longitude = request.data.get('customer_longitude')

        if len(issue) < 3:
            return Response(
                {'error': 'Please describe the issue in at least 3 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer_location = None
        try:
            if customer_latitude is not None and customer_longitude is not None:
                customer_location = (
                    float(customer_latitude),
                    float(customer_longitude),
                )
        except (TypeError, ValueError):
            customer_location = None

        diagnosis = detect_issue(issue)
        emergency, emergency_terms = is_emergency(issue)
        category_name = diagnosis['category']

        services = Service.objects.filter(is_active=True).select_related('category', 'provider', 'provider__provider_profile')
        matches = services.filter(
            Q(category__name__icontains=category_name)
            | Q(name__icontains=category_name)
            | Q(description__icontains=category_name)
            | Q(short_description__icontains=category_name)
        )

        if not matches.exists():
            words = [word for word in issue.split() if len(word) > 2][:5]
            fallback_query = Q()
            for word in words:
                fallback_query |= Q(name__icontains=word) | Q(description__icontains=word) | Q(category__name__icontains=word)
            matches = services.filter(fallback_query) if fallback_query else services.none()

        ranked_services = sorted(
            matches[:40],
            key=lambda service: provider_match_score(service, customer_location=customer_location),
            reverse=True,
        )[:6]
        service_payload = []
        best_estimate = None

        for service in ranked_services:
            estimate = estimate_for_service(service, urgency=emergency)
            if best_estimate is None:
                best_estimate = estimate
            service_payload.append({
                'id': service.id,
                'name': service.name,
                'category_name': service.category.name,
                'provider_name': service.provider.full_name,
                'provider_business': getattr(getattr(service.provider, 'provider_profile', None), 'business_name', ''),
                'provider_rating': str(getattr(getattr(service.provider, 'provider_profile', None), 'average_rating', '0.00')),
                'provider_latitude': str(service.provider.latitude) if service.provider.latitude else None,
                'provider_longitude': str(service.provider.longitude) if service.provider.longitude else None,
                'match_score': provider_match_score(service, customer_location=customer_location),
                'base_price': str(service.base_price or service.price_range_min or service.hourly_rate or 0),
                'duration_minutes': service.duration_minutes,
                'estimate': estimate,
            })

        photo = request.FILES.get('photo')
        image_diagnosis = analyze_image(photo) if photo is not None else None

        if best_estimate is None:
            best_estimate = {'min_cost': 399, 'max_cost': 899, 'duration_minutes': 60, 'urgency_fee': 150 if emergency else 0}

        return Response({
            'issue': issue,
            'area': area,
            'customer_location': customer_location,
            'suggested_category': category_name,
            'confidence': diagnosis['confidence'],
            'emergency': emergency,
            'emergency_terms': emergency_terms,
            'priority': 'TOP_PRIORITY' if emergency else 'NORMAL',
            'possible_causes': diagnosis['causes'],
            'repair_type': diagnosis['repair'],
            'estimate': best_estimate,
            'image_diagnosis': image_diagnosis,
            'recommended_services': service_payload,
            'next_actions': [
                'Book emergency slot now' if emergency else 'Choose a time slot',
                'Keep photos ready for the technician',
                'Share access notes and landmark before confirmation',
            ],
        })
