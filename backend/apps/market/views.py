import logging
import math
import time
import requests
from datetime import datetime, time as dtime
import pytz
import yfinance as yf

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as drf_status

from .services import TradeService
from .serializers import BuyOrderSerializer, SellOrderSerializer, OrderPreviewSerializer
from apps.users.serializers import TransactionSerializer

logger = logging.getLogger(__name__)

# ── Timezone & Market Hours ──────────────────────────────────────────────────
IST = pytz.timezone("Asia/Kolkata")
NSE_OPEN = dtime(9, 15)
NSE_CLOSE = dtime(15, 30)

NSE_HOLIDAYS_2026 = {
    "2026-01-26", "2026-03-06", "2026-03-19", "2026-04-03", "2026-04-14",
    "2026-05-01", "2026-05-25", "2026-07-17", "2026-08-15", "2026-10-02",
    "2026-10-22", "2026-11-09", "2026-11-23", "2026-12-25"
}

def is_nse_open_status() -> bool:
    now_ist = datetime.now(IST)
    date_str = now_ist.strftime("%Y-%m-%d")
    if date_str in NSE_HOLIDAYS_2026:
        return False
    if now_ist.weekday() >= 5:
        return False
    current = now_ist.time().replace(second=0, microsecond=0)
    return NSE_OPEN <= current <= NSE_CLOSE

# ── Simple In-Memory Cache ───────────────────────────────────────────────────
_cache_store = {}
CACHE_EXPIRY_SEC = 15

def get_cached_data(key: str):
    cached = _cache_store.get(key)
    if cached and (time.time() - cached["time"]) < CACHE_EXPIRY_SEC:
        return cached["data"]
    return None

def set_cached_data(key: str, data):
    _cache_store[key] = {"data": data, "time": time.time()}
    return data

# ── Helper to Fetch NSE India API ────────────────────────────────────────────
def fetch_nse_api(endpoint: str) -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
    }
    session = requests.Session()
    session.headers.update(headers)
    try:
        # First request to home page to set cookies
        session.get("https://www.nseindia.com/", timeout=5)
        url = f"https://www.nseindia.com/api/{endpoint}"
        resp = session.get(url, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        logger.error("Failed to fetch NSE endpoint %s: %s", endpoint, e)
    return {}

# ── Safe parsing ─────────────────────────────────────────────────────────────
def sf(val, default=0.0):
    try:
        return float(str(val).replace(",", "").strip())
    except Exception:
        return default

def fmt_vol(n: float) -> str:
    n = sf(n)
    if n >= 1e7: return f"{n/1e7:.2f} Cr"
    if n >= 1e5: return f"{n/1e5:.2f} L"
    if n >= 1e3: return f"{n/1e3:.2f} K"
    return str(int(n))

# ── Fetch Variations (Gainers, Losers, Volume) ───────────────────────────────
def fetch_nse_variations(index_type: str) -> list:
    cache_key = f"variations_{index_type}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    res_json = fetch_nse_api(f"live-analysis-variations?index={index_type}")
    records = res_json.get("NIFTY", {}).get("data", [])
    if not records:
        records = res_json.get("FOSec", {}).get("data", []) or res_json.get("allSec", {}).get("data", [])

    results = []
    for item in records[:10]:
        sym = item.get("symbol", "")
        if not sym:
            continue
        p = sf(item.get("ltp", 0))
        chg = sf(item.get("net_price", item.get("netChange", 0)))
        pct = sf(item.get("perChange", item.get("pChange", 0)))
        vol = sf(item.get("trade_quantity", item.get("volume", 0)))

        results.append({
            "symbol": sym,
            "name": sym.replace("&", " and ") + " Ltd",
            "sector": "NSE Stock",
            "price": p,
            "change": chg,
            "change_percent": pct,
            "volume": vol,
            "sparkline": [p * 0.98, p * 0.99, p * 0.97, p * 1.01, p],
            "trend": "Bullish" if chg >= 0 else "Bearish"
        })

    # Fallback to realistic mock if API fails
    if not results:
        mocks = {
            "gainers": [
                {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "price": 2984.50, "change": 42.70, "change_percent": 1.45, "volume": 2400000},
                {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "price": 4125.20, "change": 45.60, "change_percent": 1.12, "volume": 1100000},
                {"symbol": "INFY", "name": "Infosys Ltd", "price": 1568.90, "change": 13.20, "change_percent": 0.85, "volume": 3800000},
            ],
            "losers": [
                {"symbol": "SBIN", "name": "State Bank of India Ltd", "price": 834.50, "change": -10.55, "change_percent": -1.25, "volume": 8900000},
                {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "price": 1420.10, "change": -13.60, "change_percent": -0.95, "volume": 1500000},
            ],
            "volume": [
                {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "price": 1610.45, "change": 10.40, "change_percent": 0.65, "volume": 5200000},
            ]
        }
        fallback_list = mocks.get(index_type, mocks["gainers"])
        results = [
            {
                **item, "sector": "NSE Stock",
                "sparkline": [item["price"] * 0.98, item["price"] * 1.01, item["price"]],
                "trend": "Bullish" if item["change"] >= 0 else "Bearish"
            }
            for item in fallback_list
        ]

    return set_cached_data(cache_key, results)

# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_overview(request):
    """GET /api/market/overview"""
    cached = get_cached_data("market_overview")
    if cached:
        return Response(cached)

    indices_map = {
        "NIFTY 50": "Nifty 50",
        "SENSEX": "Sensex",
        "NIFTY BANK": "Bank Nifty",
        "NIFTY MIDCAP 100": "Nifty Midcap",
        "NIFTY SMALLCAP 100": "Nifty Smallcap"
    }

    res_json = fetch_nse_api("allIndices")
    records = res_json.get("data", [])
    
    data = []
    if records:
        for r in records:
            idx_name = r.get("indexName", "").upper()
            if idx_name in indices_map:
                price = sf(r.get("last", 0))
                chg = sf(r.get("percentChange", 0))
                # Create a mini sparkline
                closes = [price * 0.99, price * 0.995, price * 1.002, price * 0.998, price]
                data.append({
                    "name": indices_map[idx_name],
                    "value": price,
                    "change": sf(r.get("variation", 0)),
                    "change_percent": chg,
                    "sparkline": closes,
                    "trend": "up" if chg >= 0 else "down"
                })

    # Fallback default values
    if not data:
        data = [
            {"name": "Nifty 50", "value": 24834.85, "change": 125.40, "change_percent": 0.51, "sparkline": [24600, 24650, 24700, 24800, 24834], "trend": "up"},
            {"name": "Sensex", "value": 81332.72, "change": 412.10, "change_percent": 0.51, "sparkline": [80500, 80700, 81000, 81100, 81332], "trend": "up"},
            {"name": "Bank Nifty", "value": 51295.40, "change": -220.15, "change_percent": -0.43, "sparkline": [51500, 51600, 51400, 51350, 51295], "trend": "down"},
            {"name": "Nifty Midcap", "value": 16120.30, "change": 85.50, "change_percent": 0.53, "sparkline": [15900, 16000, 16050, 16080, 16120], "trend": "up"},
            {"name": "Nifty Smallcap", "value": 18240.10, "change": 140.20, "change_percent": 0.78, "sparkline": [18000, 18050, 18120, 18180, 18240], "trend": "up"},
        ]

    return Response(set_cached_data("market_overview", data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_search(request):
    """GET /api/market/search?q="""
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response([])

    try:
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        params = {"q": q, "quotesCount": 10, "newsCount": 0}
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=3)
        if resp.status_code == 200:
            quotes = resp.json().get("quotes", [])
            matches = []
            seen = set()
            symbols_to_fetch = []
            
            for item in quotes:
                symbol = item.get("symbol", "")
                if not symbol.upper().endswith((".NS", ".BO")):
                    continue
                if symbol in seen:
                    continue
                seen.add(symbol)
                
                name = item.get("shortname", item.get("longname", symbol))
                exchange = item.get("exchDisp", item.get("exchange", "NSE"))
                if exchange == "NSE": exchange = "NSE"
                elif exchange == "BSE": exchange = "BSE"
                
                matches.append({
                    "symbol": symbol,
                    "name": name,
                    "exchange": exchange,
                    "price": None,
                    "change": None,
                    "change_percent": None
                })
                symbols_to_fetch.append(symbol)
            
            # Enrich with real-time prices using yfinance for top matches
            if symbols_to_fetch:
                try:
                    tickers = yf.Tickers(" ".join(symbols_to_fetch[:10]))
                    for match in matches[:10]:
                        tkr = tickers.tickers.get(match["symbol"])
                        if tkr:
                            try:
                                info = tkr.info
                                price = info.get("currentPrice", info.get("regularMarketPrice"))
                                prev = info.get("previousClose")
                                
                                # Use yfinance for an accurate name if available
                                real_name = info.get("longName") or info.get("shortName")
                                if real_name:
                                    match["name"] = real_name

                                if price and prev:
                                    match["price"] = sf(price)
                                    chg = price - prev
                                    match["change"] = sf(chg)
                                    match["change_percent"] = sf(chg / prev * 100)
                            except Exception as inner_e:
                                logger.error("Error fetching info for %s: %s", match["symbol"], inner_e)
                except Exception as e:
                    logger.error("Error fetching prices for search: %s", e)

            # Strip suffix before returning to keep frontend compatibility
            for match in matches:
                match["symbol"] = match["symbol"].replace(".NS", "").replace(".BO", "")

            return Response(matches)
    except Exception as e:
        logger.error("Yahoo Search error: %s", e)
    return Response([])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_gainers(request):
    """GET /api/market/gainers"""
    return Response(fetch_nse_variations("gainers"))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_losers(request):
    """GET /api/market/losers"""
    return Response(fetch_nse_variations("losers"))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_most_active(request):
    """GET /api/market/most-active"""
    return Response(fetch_nse_variations("volume"))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_sectors(request):
    """GET /api/market/sectors"""
    cached = get_cached_data("market_sectors")
    if cached:
        return Response(cached)

    res_json = fetch_nse_api("allIndices")
    records = res_json.get("data", [])
    
    sectoral_map = {
        "NIFTY IT": "IT",
        "NIFTY BANK": "Banking",
        "NIFTY AUTO": "Auto",
        "NIFTY PHARMA": "Pharma",
        "NIFTY FMCG": "FMCG",
        "NIFTY REALTY": "Realty",
        "NIFTY METAL": "Metal",
        "NIFTY INFRA": "Infrastructure",
        "NIFTY FINANCIAL SERVICES": "Financial Services",
        "NIFTY MEDIA": "Media",
        "NIFTY PSU BANK": "PSU Banking",
        "NIFTY PRIVATE BANK": "Private Banking",
        "NIFTY CONSUMER DURABLES": "Consumer Durables",
        "NIFTY OIL & GAS": "Oil & Gas",
        "NIFTY HEALTHCARE": "Healthcare"
    }

    data = []
    if records:
        for r in records:
            idx_name = r.get("indexName", "").upper()
            if idx_name in sectoral_map:
                pct = sf(r.get("percentChange", 0))
                val = sf(r.get("last", 0))
                data.append({
                    "name": sectoral_map[idx_name],
                    "change_percent": pct,
                    "trend": "Bullish" if pct >= 0 else "Bearish",
                    "sparkline": [val * 0.99, val * 0.995, val * 1.002, val],
                    "stocks": [
                        {"symbol": "TCS" if sectoral_map[idx_name] == "IT" else "HDFCBANK", "name": "Industry Leader", "price": val, "change_percent": pct}
                    ]
                })

    if not data:
        data = [
            {"name": "IT", "change_percent": 1.45, "trend": "Bullish", "sparkline": [100, 101, 100.5, 101.45], "stocks": []},
            {"name": "Banking", "change_percent": -0.65, "trend": "Bearish", "sparkline": [100, 99.5, 99.1, 99.35], "stocks": []},
            {"name": "Auto", "change_percent": 0.85, "trend": "Bullish", "sparkline": [100, 100.2, 100.5, 100.85], "stocks": []},
            {"name": "Pharma", "change_percent": 0.32, "trend": "Bullish", "sparkline": [100, 99.8, 100.1, 100.32], "stocks": []},
            {"name": "FMCG", "change_percent": 0.25, "trend": "Bullish", "sparkline": [100, 100.1, 100.3, 100.25], "stocks": []},
            {"name": "Realty", "change_percent": 1.78, "trend": "Bullish", "sparkline": [100, 101.2, 101.5, 101.78], "stocks": []},
            {"name": "Metal", "change_percent": -1.10, "trend": "Bearish", "sparkline": [100, 99.2, 98.8, 98.90], "stocks": []},
            {"name": "Infrastructure", "change_percent": 0.45, "trend": "Bullish", "sparkline": [100, 99.9, 100.2, 100.45], "stocks": []},
            {"name": "Financial Services", "change_percent": -0.22, "trend": "Bearish", "sparkline": [100, 99.7, 99.8, 99.78], "stocks": []},
            {"name": "Media", "change_percent": 0.60, "trend": "Bullish", "sparkline": [100, 100.3, 100.2, 100.60], "stocks": []},
            {"name": "PSU Banking", "change_percent": -0.80, "trend": "Bearish", "sparkline": [100, 99.4, 99.0, 99.20], "stocks": []},
            {"name": "Private Banking", "change_percent": -0.45, "trend": "Bearish", "sparkline": [100, 99.6, 99.3, 99.55], "stocks": []},
            {"name": "Consumer Durables", "change_percent": 1.15, "trend": "Bullish", "sparkline": [100, 100.8, 101.2, 101.15], "stocks": []},
            {"name": "Oil & Gas", "change_percent": 0.95, "trend": "Bullish", "sparkline": [100, 100.3, 100.6, 100.95], "stocks": []},
            {"name": "Healthcare", "change_percent": 0.55, "trend": "Bullish", "sparkline": [100, 100.1, 100.4, 100.55], "stocks": []},
        ]

    return Response(set_cached_data("market_sectors", data))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_breadth(request):
    """GET /api/market/breadth"""
    # Fetch Nifty 50 advances/declines directly
    res_json = fetch_nse_api("allIndices")
    records = res_json.get("data", [])
    
    advances, declines, unchanged = 28, 20, 2
    for r in records:
        if r.get("indexName", "").upper() == "NIFTY 50":
            advances = int(sf(r.get("key", {}).get("advances", 28)))
            declines = int(sf(r.get("key", {}).get("declines", 20)))
            unchanged = int(sf(r.get("key", {}).get("unchanged", 2)))

    ad_ratio = round(advances / declines, 2) if declines else float(advances)
    return Response({
        "advances": advances,
        "declines": declines,
        "unchanged": unchanged,
        "ad_ratio": ad_ratio,
        "total_volume": "4.2M",
        "total_value": "12,430 Cr"
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_status(request):
    """GET /api/market/market-status"""
    is_open = is_nse_open_status()
    now_ist = datetime.now(IST)
    return Response({
        "status": "OPEN" if is_open else "CLOSED",
        "label": "Market Open" if is_open else "Market Closed",
        "last_updated": now_ist.strftime("%d %b %Y, %I:%M %p IST")
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_detail(request, symbol: str):
    """GET /api/market/stock/<symbol>"""
    sym = symbol.upper()
    yf_sym = sym if sym.endswith((".NS", ".BO")) else f"{sym}.NS"

    try:
        ticker = yf.Ticker(yf_sym)
        info = ticker.info
        price = sf(info.get("currentPrice", info.get("regularMarketPrice", 0.0)))
        prev = sf(info.get("previousClose", 0.0))
        chg = price - prev
        pct = (chg / prev * 100) if prev else 0.0

        data = {
            "symbol": sym,
            "name": info.get("longName", sym.replace("&", " and ") + " Ltd"),
            "sector": info.get("sector", "Other"),
            "price": price,
            "change": round(chg, 2),
            "change_percent": round(pct, 2),
            "open": sf(info.get("open", 0.0)),
            "high": sf(info.get("dayHigh", 0.0)),
            "low": sf(info.get("dayLow", 0.0)),
            "prev_close": prev,
            "high_52w": sf(info.get("fiftyTwoWeekHigh", 0.0)),
            "low_52w": sf(info.get("fiftyTwoWeekLow", 0.0)),
            "volume": fmt_vol(sf(info.get("volume", 0.0))),
            "market_cap": fmt_vol(sf(info.get("marketCap", 0.0))),
            "pe_ratio": round(sf(info.get("trailingPE", 0.0)), 2) if info.get("trailingPE") else "—",
            "dividend_yield": f"{sf(info.get('dividendYield', 0.0)) * 100:.2f}%" if info.get("dividendYield") else "—",
        }
    except Exception as e:
        logger.error("Error fetching detail for %s: %s", sym, e)
        # Fallback
        data = {
            "symbol": sym, "name": sym + " Ltd", "sector": "Other", "price": 1000.0, "change": 10.0, "change_percent": 1.0,
            "open": 990.0, "high": 1015.0, "low": 985.0, "prev_close": 990.0, "high_52w": 1200.0, "low_52w": 800.0,
            "volume": "1.2M", "market_cap": "50,000 Cr", "pe_ratio": "24.5", "dividend_yield": "1.2%"
        }
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_history(request, symbol: str):
    """GET /api/market/stock/<symbol>/history?period=1mo"""
    sym = symbol.upper()
    period = request.query_params.get("period", "1mo")
    yf_sym = sym if sym.endswith((".NS", ".BO")) else f"{sym}.NS"

    period_intervals = {
        "1d": "5m", "5d": "30m", "1mo": "1d",
        "3mo": "1d", "6mo": "1d", "1y": "1d"
    }
    interval = period_intervals.get(period, "1d")

    try:
        ticker = yf.Ticker(yf_sym)
        hist = ticker.history(period=period, interval=interval)
        if hist.empty:
            raise ValueError("Empty history")
        closes = [round(sf(c), 2) for c in hist["Close"].tolist()]
        timestamps = [str(i)[:16] for i in hist.index.tolist()]
        data = {
            "symbol": sym,
            "period": period,
            "closes": closes,
            "timestamps": timestamps
        }
    except Exception as e:
        logger.error("History fetch error for %s: %s", sym, e)
        # fallback
        data = {
            "symbol": sym,
            "period": period,
            "closes": [950.0, 960.0, 975.0, 970.0, 990.0, 1000.0],
            "timestamps": ["2026-07-25", "2026-07-26", "2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30"]
        }
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_news_latest(request):
    """GET /api/market/news/latest/"""
    # Realistic mock news data for StockSense
    news_data = [
        {
            "title": "Reliance Industries Q3 Results: Profit beats estimates, Jio subscriber growth robust",
            "summary": "Reliance Industries reported a strong Q3 performance, driven by retail and telecom segments, beating street expectations.",
            "source": "Moneycontrol",
            "published": "10 min ago",
            "link": "https://www.moneycontrol.com/",
            "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
            "category": "Stocks"
        },
        {
            "title": "Nifty hits new all-time high as IT and Banking stocks rally",
            "summary": "The Nifty 50 index touched a fresh record high today amid positive global cues and strong domestic inflows.",
            "source": "Economic Times",
            "published": "2 hours ago",
            "link": "https://economictimes.indiatimes.com/",
            "image": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
            "category": "Nifty"
        },
        {
            "title": "Upcoming IPOs next week: OLA Electric and Swiggy to hit the market",
            "summary": "Investors are gearing up for two major IPOs next week with OLA Electric and Swiggy expected to raise over ₹10,000 crore combined.",
            "source": "CNBC TV18",
            "published": "3 hours ago",
            "link": "https://www.cnbctv18.com/",
            "image": "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=800",
            "category": "IPO"
        },
        {
            "title": "US Federal Reserve signals potential rate cuts by year-end",
            "summary": "Fed Chair Powell indicated that if inflation data continues to soften, the central bank might consider cutting rates later this year.",
            "source": "Reuters",
            "published": "5 hours ago",
            "link": "https://www.reuters.com/",
            "image": "https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d?auto=format&fit=crop&q=80&w=800",
            "category": "Global"
        },
        {
            "title": "Indian Economy projected to grow at 7.2% in FY26: World Bank",
            "summary": "The World Bank upgraded India's GDP growth forecast for the upcoming fiscal year, citing strong domestic demand and infrastructure spending.",
            "source": "Business Standard",
            "published": "Yesterday",
            "link": "https://www.business-standard.com/",
            "image": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
            "category": "Economy"
        },
        {
            "title": "Sensex plunges 500 points in early trade on profit-booking",
            "summary": "The BSE Sensex opened significantly lower today as investors booked profits following a sustained rally over the past week.",
            "source": "Economic Times",
            "published": "Yesterday",
            "link": "https://economictimes.indiatimes.com/",
            "image": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
            "category": "Sensex"
        },
        {
            "title": "TCS announces ₹15,000 crore share buyback program",
            "summary": "IT major Tata Consultancy Services has approved a share buyback program at ₹4,150 per share to reward its shareholders.",
            "source": "Moneycontrol",
            "published": "Yesterday",
            "link": "https://www.moneycontrol.com/",
            "image": "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&q=80&w=800",
            "category": "Stocks"
        },
        {
            "title": "SEBI proposes new regulations for algorithmic trading by retail investors",
            "summary": "The market regulator has issued a consultation paper aiming to regulate the use of APIs and algos by retail traders to prevent systemic risks.",
            "source": "CNBC TV18",
            "published": "2 days ago",
            "link": "https://www.cnbctv18.com/",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            "category": "Market"
        }
    ]
    return Response(news_data)

# ═════════════════════════════════════════════════════════════════════════════
# LEGACY ENDPOINTS (FOR DASHBOARD SIDEBAR/LIVE REFRESH COMPATIBILITY)
# ═════════════════════════════════════════════════════════════════════════════

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_status_legacy(request):
    is_open = is_nse_open_status()
    now_ist = datetime.now(IST)
    return Response({
        "is_open": is_open,
        "label": "Market Open" if is_open else "Market Closed",
        "checked_at": now_ist.strftime("%d %b %Y, %I:%M %p IST")
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_gainers(request):
    gainers = fetch_nse_variations("gainers")
    return Response({
        "success": True,
        "is_live": is_nse_open_status(),
        "market_status": "OPEN" if is_nse_open_status() else "CLOSED",
        "data": {
            "top_gainers": gainers[:5]
        }
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_losers(request):
    losers = fetch_nse_variations("losers")
    return Response({
        "success": True,
        "is_live": is_nse_open_status(),
        "market_status": "OPEN" if is_nse_open_status() else "CLOSED",
        "data": {
            "top_losers": losers[:5]
        }
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def live_market_data(request):
    is_open = is_nse_open_status()
    now_ist = datetime.now(IST)
    
    nifty = next((s for s in market_overview(request._request).data if s["name"] == "Nifty 50"), None)
    sensex = next((s for s in market_overview(request._request).data if s["name"] == "Sensex"), None)
    bank_nifty = next((s for s in market_overview(request._request).data if s["name"] == "Bank Nifty"), None)

    gainers = fetch_nse_variations("gainers")[:3]

    return Response({
        "indices": {
            "nifty_50": {"name": "NIFTY 50", "value": f"{nifty['value']:,.2f}" if nifty else "24,834.85", "change": f"+{nifty['change']}" if nifty and nifty['change'] >=0 else str(nifty['change'] if nifty else "-0.00"), "change_percent": f"{nifty['change_percent']}%" if nifty else "0.00%", "trend": nifty["trend"] if nifty else "up", "chart": nifty["sparkline"] if nifty else []},
            "sensex": {"name": "SENSEX", "value": f"{sensex['value']:,.2f}" if sensex else "81,332.72", "change": f"+{sensex['change']}" if sensex and sensex['change'] >=0 else str(sensex['change'] if sensex else "-0.00"), "change_percent": f"{sensex['change_percent']}%" if sensex else "0.00%", "trend": sensex["trend"] if sensex else "up", "chart": sensex["sparkline"] if sensex else []},
            "bank_nifty": {"name": "BANK NIFTY", "value": f"{bank_nifty['value']:,.2f}" if bank_nifty else "51,295.40", "change": f"+{bank_nifty['change']}" if bank_nifty and bank_nifty['change'] >=0 else str(bank_nifty['change'] if bank_nifty else "-0.00"), "change_percent": f"{bank_nifty['change_percent']}%" if bank_nifty else "0.00%", "trend": bank_nifty["trend"] if bank_nifty else "up", "chart": bank_nifty["sparkline"] if bank_nifty else []},
        },
        "trending_stocks": [
            {"symbol": s["symbol"], "name": s["name"], "price": f"{s['price']:,.2f}", "change": f"{s['change_percent']}%", "trend": "up" if s["change"] >= 0 else "down", "logo": s["symbol"][0], "chart": s["sparkline"]}
            for s in gainers
        ],
        "market_status": {
            "is_open": is_open,
            "label": "Market Open" if is_open else "Market Closed",
            "fetched_at": now_ist.strftime("%d %b %Y, %I:%M:%S %p IST")
        }
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def buy_stock(request):
    serializer = BuyOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)
        
    try:
        result = TradeService.execute_buy(request.user, serializer.validated_data)
        # Serialize the transaction object for the response
        txn_data = TransactionSerializer(result.pop("transaction")).data
        result["transaction"] = txn_data
        return Response(result, status=drf_status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({"error": str(e)}, status=drf_status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Buy execution error: {e}", exc_info=True)
        return Response({"error": "An internal error occurred during execution."}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sell_stock(request):
    serializer = SellOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)
        
    try:
        result = TradeService.execute_sell(request.user, serializer.validated_data)
        # Serialize the transaction object for the response
        txn_data = TransactionSerializer(result.pop("transaction")).data
        result["transaction"] = txn_data
        return Response(result, status=drf_status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({"error": str(e)}, status=drf_status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Sell execution error: {e}", exc_info=True)
        return Response({"error": "An internal error occurred during execution."}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_orders(request):
    try:
        orders = TradeService.get_pending_orders(request.user)
        serializer = TransactionSerializer(orders, many=True)
        return Response({"pending_orders": serializer.data})
    except Exception as e:
        logger.error(f"Pending orders error: {e}", exc_info=True)
        return Response({"error": "Failed to fetch pending orders."}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_preview(request):
    serializer = OrderPreviewSerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)
        
    try:
        symbol = serializer.validated_data["stock_symbol"]
        qty = serializer.validated_data["quantity"]
        market_price = TradeService.get_live_price(symbol)
        
        return Response({
            "stock_symbol": symbol,
            "quantity": qty,
            "estimated_price": market_price,
            "total_estimated_value": market_price * qty
        })
    except ValueError as e:
        return Response({"error": str(e)}, status=drf_status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Order preview error: {e}", exc_info=True)
        return Response({"error": "Failed to generate order preview."}, status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR)
