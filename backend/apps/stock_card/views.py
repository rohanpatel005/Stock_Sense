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
        
    print("Received:", symbol)
    logger.info(f"Symbol received: {symbol}")
        
    try:
        data = StockCardService.get_stock_data(symbol)
        return Response(data, status=status.HTTP_200_OK)
    except ValueError as val_err:
        logger.warning("Stock not found: %s - %s", symbol, val_err)
        return Response({"error": f"Symbol '{symbol}' not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error("Error retrieving stock card details for %s: %s", symbol, e)
        return Response({"error": "An internal error occurred while fetching stock details."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def ai_analysis_view(request):
    """
    POST /api/share/ai-analysis/
    Expected JSON: {"symbol": "RELIANCE.NS"}
    Returns markdown string of AI analysis.
    """
    symbol = request.data.get("symbol")
    if not symbol:
        return Response({"error": "Symbol is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        analysis_markdown = StockCardService.generate_stock_ai_analysis(symbol)
        return Response({"analysis": analysis_markdown}, status=status.HTTP_200_OK)
    except ValueError as val_err:
        logger.warning("Stock not found for AI analysis: %s - %s", symbol, val_err)
        return Response({"error": f"Symbol '{symbol}' not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error("Error generating AI analysis for %s: %s", symbol, e)
        return Response({"error": "Unable to generate AI analysis right now."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def latest_news_view(request, symbol: str):
    """
    GET /api/share/<symbol>/news/
    Returns the latest news articles for the stock.
    """
    if not symbol:
        return Response({"error": "Symbol is required."}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        news = StockCardService.get_latest_news(symbol)
        return Response(news, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error("Error fetching news for %s: %s", symbol, e)
        # Fallback to empty list so frontend doesn't break
        return Response([], status=status.HTTP_200_OK)
