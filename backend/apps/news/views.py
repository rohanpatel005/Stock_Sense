from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import fetch_latest_news

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_news(request):
    """
    Returns the latest 10 news articles from Google News RSS.
    """
    news_articles = fetch_latest_news()
    return Response(news_articles)
