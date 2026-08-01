import logging
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import StockCardService

logger = logging.getLogger(__name__)

@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def get_stock_card(request, symbol: str):
    """
    GET /api/share/<symbol>/
    Returns complete aggregated live data for the given stock card.
    """
    if not symbol:
        return Response({"error": "Symbol parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        data = StockCardService.get_stock_data(symbol)
        return Response(data, status=status.HTTP_200_OK)
    except ValueError as val_err:
        logger.warning("Stock not found: %s - %s", symbol, val_err)
        return Response({"error": f"Symbol '{symbol}' not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error("Error retrieving stock card details for %s: %s", symbol, e)
        return Response({"error": "An internal error occurred while fetching stock details."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
