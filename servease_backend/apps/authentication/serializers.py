"""
Authentication Serializers
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from ..users.models import User, OTP


class SignupSerializer(serializers.ModelSerializer):
    """Signup serializer"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'phone', 'first_name', 'last_name', 'password', 'confirm_password', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email and password are required.')
        
        return attrs


class SendOTPSerializer(serializers.Serializer):
    """Send OTP serializer"""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, max_length=15)
    otp_type = serializers.ChoiceField(choices=OTP.OTP_TYPE_CHOICES)
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError('Either email or phone is required.')
        return attrs


class OTPVerifySerializer(serializers.Serializer):
    """Verify OTP serializer"""
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, max_length=15)
    otp = serializers.CharField(max_length=6, min_length=6)
    otp_type = serializers.ChoiceField(choices=OTP.OTP_TYPE_CHOICES)


class ForgotPasswordSerializer(serializers.Serializer):
    """Forgot password serializer"""
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password serializer"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
            'role', 'profile_image', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'pincode', 'country',
            'is_verified', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'is_active', 'created_at', 'updated_at']