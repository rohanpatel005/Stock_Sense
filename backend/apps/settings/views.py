from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings
import random
from .services.reset_service import ResetPaperTradingService, ResetError

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def settings_profile(request):
    user = request.user
    
    # Check if month rolled over to reset the displayed count
    now = timezone.now()
    if user.last_reset_date and user.last_reset_date.month != now.month:
        user.monthly_reset_count = 0
        user.save(update_fields=['monthly_reset_count'])

    return Response({
        "name": user.full_name,
        "email": user.email,
        "balance": float(user.wallet),
        "remaining_resets": 3 - user.monthly_reset_count,
        "last_reset": user.last_reset_date.strftime('%Y-%m-%d') if user.last_reset_date else None
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_reset_otp(request):
    user = request.user
    
    # Generate OTP
    otp = f"{random.randint(1000, 9999)}"
    
    # Store OTP in cache
    cache_key = f"paper_reset_otp_{user.email}"
    cache.set(cache_key, otp, timeout=600)
    
    # Send Email
    try:
        send_mail(
            subject="StockSense Paper Trading Reset OTP",
            message=f"Hello {user.full_name},\n\nYour OTP to reset your paper trading account is: {otp}\nThis code is valid for 10 minutes.\n\nThank you!",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@stocksense.com"),
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        return Response(
            {"message": "OTP generated, but failed to send verification email.", "email": user.email, "otp": otp},
            status=status.HTTP_200_OK
        )
        
    return Response({"success": True, "message": "OTP sent successfully.", "email": user.email}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_paper_account(request):
    otp = request.data.get("otp")
    if not otp:
        return Response({"success": False, "message": "OTP is required."}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    cache_key = f"paper_reset_otp_{user.email}"
    cached_otp = cache.get(cache_key)

    if not cached_otp:
        return Response({"success": False, "message": "OTP has expired or was not requested."}, status=status.HTTP_400_BAD_REQUEST)
        
    if cached_otp != otp:
        return Response({"success": False, "message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ResetPaperTradingService.process_reset(user)
        # Clear the OTP cache after successful reset
        cache.delete(cache_key)
        
        return Response({
            "success": True,
            "message": "Paper trading account reset successfully.",
            "balance": 50000.00,
            "remaining_resets": 3 - user.monthly_reset_count,
            "last_reset": user.last_reset_date.strftime('%Y-%m-%d') if user.last_reset_date else None
        }, status=status.HTTP_200_OK)
    except ResetError as e:
        return Response({
            "success": False,
            "message": e.message
        }, status=e.status_code)
    except Exception:
        return Response({
            "success": False,
            "message": "An unexpected error occurred."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
