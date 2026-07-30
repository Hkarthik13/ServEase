"""
Authentication Views
"""
from rest_framework import status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random
import string

from ..users.models import User, OTP
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    OTPVerifySerializer,
    SendOTPSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ProfileSerializer,
)


class SignupView(generics.GenericAPIView):
    """User signup"""
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        OTP.objects.create(
            user=user,
            email=user.email,
            otp=otp,
            otp_type='EMAIL',
            expires_at=expires_at
        )
        
        # TODO: Send OTP email via Celery
        # send_otp_email.delay(user.email, otp)
        
        return Response({
            'message': 'User created successfully. Please verify your email.',
            'user': ProfileSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """User login"""
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': ProfileSerializer(user).data,
        }, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    """User logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SendOTPView(generics.GenericAPIView):
    """Send OTP for verification"""
    serializer_class = SendOTPSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email')
        phone = serializer.validated_data.get('phone')
        otp_type = serializer.validated_data['otp_type']
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        # Find or create user
        user = None
        if email:
            user = User.objects.filter(email=email).first()
            OTP.objects.create(
                user=user,
                email=email,
                otp=otp,
                otp_type=otp_type,
                expires_at=expires_at
            )
            # TODO: Send OTP via Celery
            # send_otp_email.delay(email, otp)
        
        return Response({
            'message': 'OTP sent successfully',
            'otp': otp  # Remove in production
        }, status=status.HTTP_200_OK)


class VerifyOTPView(generics.GenericAPIView):
    """Verify OTP"""
    serializer_class = OTPVerifySerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email')
        phone = serializer.validated_data.get('phone')
        otp = serializer.validated_data['otp']
        otp_type = serializer.validated_data['otp_type']
        
        # Find valid OTP
        otp_obj = OTP.objects.filter(
            email=email,
            phone=phone,
            otp=otp,
            otp_type=otp_type,
            is_used=False,
            expires_at__gte=timezone.now()
        ).first()
        
        if not otp_obj:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        # Verify user if exists
        user = None
        if email:
            user = User.objects.filter(email=email).first()
            if user:
                user.is_verified = True
                user.save(update_fields=['is_verified'])
        
        return Response({
            'message': 'OTP verified successfully',
            'verified': True
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(generics.GenericAPIView):
    """Forgot password - send OTP"""
    serializer_class = SendOTPSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTP.objects.create(
            user=user,
            email=email,
            otp=otp,
            otp_type='PASSWORD_RESET',
            expires_at=expires_at
        )
        
        # TODO: Send OTP email via Celery
        # send_password_reset_otp.delay(email, otp)
        
        return Response({
            'message': 'Password reset OTP sent to your email'
        }, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """Reset password with OTP"""
    serializer_class = ResetPasswordSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        password = serializer.validated_data['password']
        
        # Verify OTP
        otp_obj = OTP.objects.filter(
            email=email,
            otp=otp,
            otp_type='PASSWORD_RESET',
            is_used=False,
            expires_at__gte=timezone.now()
        ).first()
        
        if not otp_obj:
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Reset password
        user.set_password(password)
        user.save()
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get/Update user profile"""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user