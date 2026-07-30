"""
Bookings Views
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Booking, BookingStatusHistory
from .serializers import BookingSerializer


class BookingListCreateView(generics.ListCreateAPIView):
    """List and create bookings"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            return Booking.objects.filter(provider=user)
        elif user.role == 'ADMIN':
            return Booking.objects.all()
        return Booking.objects.filter(customer=user)
    
    def perform_create(self, serializer):
        from decimal import Decimal
        from django.db import transaction
        from apps.payments.models import Wallet, WalletTransaction
        
        service = serializer.validated_data.get('service')
        coupon = serializer.validated_data.get('coupon')
        payment_method = serializer.validated_data.get('payment_method', 'UPI')
        special_instructions = serializer.validated_data.get('special_instructions', '')
        requested_urgent = serializer.validated_data.get('is_urgent', False)
        try:
            from apps.services.ai_utils import is_emergency
            detected_urgent, _ = is_emergency(special_instructions)
        except Exception:
            detected_urgent = False
        
        base_price = service.base_price or Decimal('0.00')
        tax = base_price * Decimal('0.05')
        platform_fee = Decimal('15.00')
        urgency_charge = Decimal('150.00') if (requested_urgent or detected_urgent) else Decimal('0.00')
        
        # Calculate discount
        discount_amount = Decimal('0.00')
        if coupon:
            try:
                coupon_val = Decimal(str(coupon.discount_value))
                if coupon.discount_type == 'PERCENTAGE':
                    discount_amount = base_price * (coupon_val / Decimal('100.0'))
                    if coupon.maximum_discount:
                        discount_amount = min(discount_amount, Decimal(str(coupon.maximum_discount)))
                else:
                    discount_amount = coupon_val
                discount_amount = min(discount_amount, base_price)
            except Exception:
                discount_amount = Decimal('0.00')
                
        total_amount = base_price + tax + platform_fee + urgency_charge - discount_amount
        provider_amount = base_price
        
        with transaction.atomic():
            if payment_method == 'WALLET':
                wallet, _ = Wallet.objects.get_or_create(customer=self.request.user)
                if wallet.balance < total_amount:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({'error': 'Insufficient wallet balance for this booking'})
                
                wallet.balance -= total_amount
                wallet.save()
                
                WalletTransaction.objects.create(
                    wallet=wallet,
                    transaction_type='DEBIT',
                    amount=total_amount,
                    description=f"Payment for booking of {service.name}"
                )
                payment_status = 'PAID'
            else:
                payment_status = serializer.validated_data.get('payment_status', 'PAID')

            booking = serializer.save(
                customer=self.request.user,
                category=service.category,
                provider=service.provider,
                base_price=base_price,
                tax_amount=tax,
                platform_fee=platform_fee,
                additional_charges=urgency_charge,
                discount_amount=discount_amount,
                total_amount=total_amount,
                provider_amount=provider_amount,
                payment_status=payment_status,
                status='PENDING',
                is_urgent=requested_urgent or detected_urgent
            )

        # Send email alert to admin
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            admin_email = 'srkarthik1384@gmail.com'
            subject = f"New Booking Request - {booking.booking_id}"
            
            customer = booking.customer
            customer_name = customer.full_name
            customer_email = customer.email
            customer_phone = customer.phone or 'N/A'
            
            service_name = booking.service.name
            category_name = booking.category.name
            date_time = f"{booking.service_date} at {booking.service_time}"
            total_amount = booking.total_amount
            special_instructions = booking.special_instructions or 'None'
            
            body = (
                f"Hello Admin,\n\n"
                f"A new service booking request has been placed. Here are the details:\n\n"
                f"--- CUSTOMER DETAILS ---\n"
                f"Name: {customer_name}\n"
                f"Email: {customer_email}\n"
                f"Phone: {customer_phone}\n\n"
                f"--- SERVICE DETAILS ---\n"
                f"Service: {service_name}\n"
                f"Category: {category_name}\n"
                f"Scheduled For: {date_time}\n"
                f"Total Price: {settings.CURRENCY_SYMBOL}{total_amount} ({settings.CURRENCY})\n"
                f"Special Instructions: {special_instructions}\n\n"
                f"--- BOOKING DETAILS ---\n"
                f"Booking ID: {booking.booking_id}\n"
                f"Status: {booking.status}\n"
                f"Payment Status: {booking.payment_status}\n\n"
                f"Please review this booking in the Admin Dashboard.\n\n"
                f"Best regards,\n"
                f"ServEase System"
            )
            
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=False,
            )
        except Exception as e:
            import logging
            logger = logging.getLogger('apps')
            logger.error(f"Failed to send email to admin: {str(e)}")



class BookingDetailView(generics.RetrieveAPIView):
    """Get booking details"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            return Booking.objects.filter(provider=user)
        elif user.role == 'ADMIN':
            return Booking.objects.all()
        return Booking.objects.filter(customer=user)


class CancelBookingView(generics.UpdateAPIView):
    """Cancel booking"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        user = request.user
        if user.role == 'PROVIDER':
            booking.status = 'CANCELLELED_BY_PROVIDER'
        elif user.role == 'ADMIN':
            booking.status = 'CANCELLELED_BY_ADMIN'
        else:
            booking.status = 'CANCELLELED_BY_CUSTOMER'
        
        booking.canceled_at = timezone.now()
        booking.save()
        
        BookingStatusHistory.objects.create(
            booking=booking,
            status=booking.status,
            notes=request.data.get('notes', f"Booking canceled by {user.role.lower()}"),
            changed_by=user
        )
        return Response({'message': f'Booking canceled as {booking.status}', 'status': booking.status})
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            return Booking.objects.filter(provider=user)
        elif user.role == 'ADMIN':
            return Booking.objects.all()
        return Booking.objects.filter(customer=user)


class UpdateBookingStatusView(generics.UpdateAPIView):
    """Update booking status (Provider/Admin only)"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROVIDER':
            return Booking.objects.filter(provider=user)
        elif user.role == 'ADMIN':
            return Booking.objects.all()
        return Booking.objects.none()
        
    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', f"Status updated to {new_status} by Provider")
        
        valid_statuses = [choice[0] for choice in Booking.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Choose from: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = new_status
        if new_status == 'ACCEPTED':
            booking.accepted_at = timezone.now()
        elif new_status == 'IN_PROGRESS':
            booking.started_at = timezone.now()
        elif new_status == 'COMPLETED':
            booking.completed_at = timezone.now()
            booking.payment_status = 'PAID'
            
        booking.save()
        
        # Track history
        BookingStatusHistory.objects.create(
            booking=booking,
            status=new_status,
            notes=notes,
            changed_by=request.user
        )
        
        # Update provider stats if completed
        if new_status == 'COMPLETED' and booking.provider:
            try:
                provider_profile = booking.provider.provider_profile
                provider_profile.total_jobs += 1
                provider_profile.total_earnings += booking.provider_amount
                provider_profile.save()
            except Exception:
                pass
                
        return Response(BookingSerializer(booking).data)
