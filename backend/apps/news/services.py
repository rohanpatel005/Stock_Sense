import feedparser
import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

RSS_URL = "https://news.google.com/rss/search?q=Indian+Stock+Market&hl=en-IN&gl=IN&ceid=IN:en"
CACHE_KEY = "google_news_indian_stock_market"
CACHE_TTL = 300  # 5 minutes

def fetch_latest_news():
    """
    Fetches the latest 10 news articles from Google News RSS.
    Caches the results for 5 minutes.
    """
    cached_news = cache.get(CACHE_KEY)
    if cached_news is not None:
        return cached_news

    try:
        feed = feedparser.parse(RSS_URL)
        if not feed or not feed.entries:
            return []

        articles = []
        for entry in feed.entries[:10]:
            articles.append({
                "title": entry.get("title", ""),
                "description": entry.get("summary", ""),
                "published_at": entry.get("published", ""),
                "source": entry.get("source", {}).get("title", "Google News") if hasattr(entry, "source") else "Google News",
                "article_url": entry.get("link", "")
            })

        cache.set(CACHE_KEY, articles, CACHE_TTL)
        return articles
    except Exception as e:
        logger.error(f"Failed to fetch RSS news: {e}")
        return []
