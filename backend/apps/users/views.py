import random
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    LoginSerializer,
    GoogleRegisterSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from .google_auth import verify_google_token

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = serializer.validated_data
        email = validated_data["email"]
        full_name = validated_data["full_name"]
        password = validated_data["password"]
        
        # Generate OTP
        otp = f"{random.randint(1000, 9999)}"
        
        # Store registration data temporarily in cache (valid for 10 minutes)
        cache_key = f"signup_{email}"
        cache.set(
            cache_key,
            {
                "otp": otp,
                "full_name": full_name,
                "password": password
            },
            timeout=600
        )
        
        # Send Email
        try:
            send_mail(
                subject="Verify your StockSense Account",
                message=f"Hello {full_name},\n\nYour OTP for registration is: {otp}\n\nThank you!",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@stocksense.com"),
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            # Return warning but cache is still set for local debugging
            return Response(
                {"message": "OTP generated, but failed to send verification email.", "email": email, "otp": otp},
                status=status.HTTP_201_CREATED
            )
            
        return Response(
            {"message": "Registration OTP sent successfully. Please verify to create your account.", "email": email},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_registration_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        
        # Ensure email is not already registered in DB
        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email is already registered."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Fetch signup details from cache
        cache_key = f"signup_{email}"
        signup_data = cache.get(cache_key)
        
        if not signup_data:
            return Response({"error": "OTP has expired or registration session is invalid. Please sign up again."}, status=status.HTTP_400_BAD_REQUEST)
            
        if signup_data["otp"] != otp:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
            
        # OTP matches! Create the user in the database now
        try:
            user = User.objects.create_user(
                email=email,
                full_name=signup_data["full_name"],
                password=signup_data["password"],
                is_verified=True,
                is_active=True
            )
            
            # Clear cache session
            cache.delete(cache_key)
            
            return Response({"message": "Email verified and user account created successfully! You can now login."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Failed to create user account: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        
        user = authenticate(email=email, password=password)
        if user is not None:
            if not user.is_active:
                return Response({"error": "User account is disabled."}, status=status.HTTP_403_FORBIDDEN)
                
            if not user.is_verified:
                return Response({"error": "Email not verified.", "needs_verification": True, "email": user.email}, status=status.HTTP_403_FORBIDDEN)
                
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "email": user.email,
                    "full_name": user.full_name,
                    "wallet": str(user.wallet)
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_register(request):
    serializer = GoogleRegisterSerializer(data=request.data)
    if serializer.is_valid():
        credential = serializer.validated_data["credential"]

        # Verify the Google ID token
        try:
            payload = verify_google_token(credential)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = payload.get("email")
        full_name = payload.get("name", "")
        google_id = payload.get("sub")

        if not email:
            return Response(
                {"error": "Google account does not have an email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        
        if user:
            if not user.google_id:
                user.google_id = google_id
                user.save(update_fields=['google_id'])
            if not user.is_verified:
                user.is_verified = True
                user.save(update_fields=['is_verified'])
        else:
            try:
                user = User(
                    email=email,
                    full_name=full_name,
                    google_id=google_id,
                    auth_provider="google",
                    is_verified=True,
                    is_active=True,
                )
                user.set_unusable_password()
                user.save()
            except Exception as e:
                return Response(
                    {"error": f"Failed to create user account: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Authentication successful.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "email": user.email,
                "full_name": user.full_name,
                "wallet": str(user.wallet),
            }
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        
        # Check if user exists
        if not User.objects.filter(email=email).exists():
            return Response({"error": "No account found with this email."}, status=status.HTTP_404_NOT_FOUND)
            
        # Generate OTP
        otp = f"{random.randint(1000, 9999)}"
        
        # Store OTP temporarily in cache (valid for 10 minutes)
        cache_key = f"reset_otp_{email}"
        cache.set(cache_key, otp, timeout=600)
        
        # Send Email
        try:
            send_mail(
                subject="StockSense Password Reset OTP",
                message=f"Hello,\n\nYour OTP to reset your password is: {otp}\nThis code is valid for 10 minutes.\n\nThank you!",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@stocksense.com"),
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"message": "OTP generated, but failed to send verification email.", "email": email, "otp": otp},
                status=status.HTTP_200_OK
            )
            
        return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        
        cache_key = f"reset_otp_{email}"
        cached_otp = cache.get(cache_key)
        
        if not cached_otp:
            return Response({"error": "OTP has expired or was not requested."}, status=status.HTTP_400_BAD_REQUEST)
            
        if cached_otp != otp:
            return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Clear the OTP cache and set a verified flag
        cache.delete(cache_key)
        cache.set(f"reset_verified_{email}", True, timeout=600)
        
        return Response({"verified": True, "message": "OTP verified successfully."}, status=status.HTTP_200_OK)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        
        verified_key = f"reset_verified_{email}"
        if not cache.get(verified_key):
            return Response({"error": "Unauthorized. Please verify OTP first."}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            
            # Clear verification token
            cache.delete(verified_key)
            
            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
