from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
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
def reset_paper_account(request):
    password = request.data.get("password")
    if not password:
        return Response({"success": False, "message": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ResetPaperTradingService.process_reset(request.user, password)
        return Response({
            "success": True,
            "message": "Paper trading account reset successfully.",
            "balance": 50000.00,
            "remaining_resets": 3 - request.user.monthly_reset_count,
            "last_reset": request.user.last_reset_date.strftime('%Y-%m-%d') if request.user.last_reset_date else None
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
