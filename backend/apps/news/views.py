from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
import logging

from .services import get_latest_news, get_news_by_category, search_news
from .serializers import NewsSerializer

logger = logging.getLogger(__name__)

CACHE_TIMEOUT = 300  # 5 minutes

def format_success_response(data: list) -> dict:
    serializer = NewsSerializer(data, many=True)
    return {
        "success": True,
        "count": len(data),
        "data": serializer.data
    }

def format_error_response(message: str = "Unable to fetch news.") -> dict:
    return {
        "success": False,
        "message": message
    }

@api_view(["GET"])
@permission_classes([AllowAny])
def latest_news_view(request):
    """GET /api/news/latest/"""
    cache_key = "news_latest"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        news_data = get_latest_news(limit=15)
        response_data = format_success_response(news_data)
        cache.set(cache_key, response_data, CACHE_TIMEOUT)
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error fetching latest news: {e}", exc_info=True)
        return Response(format_error_response(), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def category_news_view(request, category: str):
    """GET /api/news/category/<category>/"""
    cache_key = f"news_category_{category.lower()}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        news_data = get_news_by_category(category, limit=15)
        response_data = format_success_response(news_data)
        cache.set(cache_key, response_data, CACHE_TIMEOUT)
        return Response(response_data, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response(format_error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error fetching news for category {category}: {e}", exc_info=True)
        return Response(format_error_response(), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def search_news_view(request):
    """GET /api/news/search/?q=..."""
    query = request.query_params.get("q", "").strip()
    if not query:
        return Response(format_error_response("Search query 'q' is required."), status=status.HTTP_400_BAD_REQUEST)

    cache_key = f"news_search_{query.lower()}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data, status=status.HTTP_200_OK)

    try:
        news_data = search_news(query, limit=15)
        response_data = format_success_response(news_data)
        cache.set(cache_key, response_data, CACHE_TIMEOUT)
        return Response(response_data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error searching news for '{query}': {e}", exc_info=True)
        return Response(format_error_response(), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
