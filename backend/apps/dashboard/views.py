from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Returns high-level statistics and data for the logged-in user dashboard.
    """
    user = request.user
    return Response({
        "message": "Welcome to your StockSense Dashboard!",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "wallet": str(user.wallet),
        },
        "stats": {
            "total_value": 152430.50,
            "today_gain": 1240.20,
            "today_gain_percent": 0.82,
            "positions_count": 5
        }
    }, status=status.HTTP_200_OK)
