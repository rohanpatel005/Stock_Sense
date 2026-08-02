import feedparser
import re
import html
import urllib.parse
from datetime import datetime
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from googlenewsdecoder import new_decoderv1

logger = logging.getLogger(__name__)

# Map categories to search queries in Google News RSS
CATEGORY_MAP = {
    "market": "Stock Market",
    "indian stock market": "Indian Stock Market",
    "nifty": "Nifty",
    "sensex": "Sensex",
    "stocks": "Stocks",
    "ipo": "IPO",
    "economy": "Economy",
    "global": "Global Market"
}

def clean_html(raw_html: str) -> str:
    """Removes HTML tags and unescapes HTML entities from a string."""
    if not raw_html:
        return ""
    # Remove HTML tags using regex
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Unescape html entities like &amp; &quot;
    return html.unescape(cleantext).strip()

def extract_image_url(entry) -> str:
    """Attempt to extract an image URL from the feed entry."""
    # Sometimes it's in media_content
    if hasattr(entry, 'media_content'):
        for media in entry.media_content:
            if 'url' in media:
                return media['url']
    # Sometimes it's in an img tag inside the summary
    summary = entry.get("summary", "")
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', summary)
    if img_match:
        return img_match.group(1)
    return ""

def resolve_google_news_url(url: str) -> str:
    """Attempts to decode a Google News redirect URL to the original publisher URL."""
    try:
        if not url.startswith("https://news.google.com"):
            return url
        
        result = new_decoderv1(url)
        if result and result.get("status") and result.get("decoded_url"):
            return result["decoded_url"]
        else:
            logger.warning(f"Failed to decode Google News URL: {url}. Result: {result}")
            return url
    except Exception as e:
        logger.error(f"Exception decoding Google News URL {url}: {e}")
        return url

def _parse_feed(url: str, limit: int = 15, default_category: str = "Market") -> list:
    """Helper to fetch and parse the RSS feed returning the structured list."""
    try:
        feed = feedparser.parse(url)
        results = []
        for entry in feed.entries[:limit]:
            # Fallback for published time if missing
            published_str = entry.get("published", "")
            if not published_str:
                published_str = datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")
            
            # Google news source is usually in the source attribute, or part of title
            source = entry.get("source", {}).get("title", "")
            if not source:
                # Sometimes title is "Headline - Source Name"
                parts = entry.get("title", "").rsplit(" - ", 1)
                if len(parts) > 1:
                    source = parts[-1].strip()
                else:
                    source = "News"

            # Title
            title = entry.get("title", "")
            parts = title.rsplit(" - ", 1)
            if len(parts) > 1:
                title = parts[0].strip()

            results.append({
                "title": html.unescape(title),
                "summary": clean_html(entry.get("summary", "")),
                "source": html.unescape(source),
                "published": published_str,
                "link": entry.get("link", ""),
                "image": extract_image_url(entry),
                "category": default_category
            })
            
        # Concurrently resolve Google News links
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_idx = {
                executor.submit(resolve_google_news_url, results[i]["link"]): i
                for i in range(len(results))
            }
            for future in as_completed(future_to_idx):
                idx = future_to_idx[future]
                try:
                    resolved_url = future.result()
                    results[idx]["link"] = resolved_url
                except Exception as exc:
                    logger.error(f"Link resolution generated an exception: {exc}")

        return results
    except Exception as e:
        logger.error(f"Error parsing RSS from {url}: {e}", exc_info=True)
        return []

def get_latest_news(limit: int = 15) -> list:
    """Fetch the latest top news stories."""
    url = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    return _parse_feed(url, limit=limit, default_category="Top News")

def get_news_by_category(category: str, limit: int = 15) -> list:
    """Fetch news for a specific mapped category."""
    cat_key = category.lower()
    query = CATEGORY_MAP.get(cat_key)
    if not query:
        raise ValueError(f"Unsupported category: {category}")
    
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    # Format category name nicely for return
    formatted_cat = next((k for k in CATEGORY_MAP.keys() if k == cat_key), category).title()
    if formatted_cat == "Ipo": formatted_cat = "IPO"
    
    return _parse_feed(url, limit=limit, default_category=formatted_cat)

def search_news(query: str, limit: int = 15) -> list:
    """Search for news articles matching the query."""
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    return _parse_feed(url, limit=limit, default_category="Search")
