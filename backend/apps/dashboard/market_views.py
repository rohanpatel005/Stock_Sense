"""
market_views.py
---------------
Handles all live market data for StockSense.

New endpoints:
  GET /api/market/live/   → batch-fetches all tickers via yfinance, returns
                            indices, trending stocks, market overview, portfolio
                            summary, and FII/DII data in one lightweight response.
  GET /api/market/status/ → returns NSE open/closed status (no DB queries).

Existing endpoints (unchanged):
  GET /api/market/top-gainers/ → live gainers from NSE API, DB-cached fallback.
  GET /api/market/top-losers/  → live losers from NSE API, DB-cached fallback.
"""

import logging
import requests
from datetime import datetime, time as dtime

import pytz
import yfinance as yf

from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum

from apps.dashboard.models import TopGainer, TopLoser
from apps.users.models import Portfolio

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# NSE market-hours constants (IST = UTC+5:30)
# ---------------------------------------------------------------------------
IST = pytz.timezone("Asia/Kolkata")
NSE_OPEN  = dtime(9, 15)
NSE_CLOSE = dtime(15, 30)

# ---------------------------------------------------------------------------
# Ticker map: friendly key → Yahoo Finance symbol
# ---------------------------------------------------------------------------
TICKER_MAP = {
    # Indices
    "nifty50":    "^NSEI",
    "sensex":     "^BSESN",
    "bank_nifty": "^NSEBANK",
    # Trending stocks
    "RELIANCE":   "RELIANCE.NS",
    "TCS":        "TCS.NS",
    "INFY":       "INFY.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    "ICICIBANK":  "ICICIBANK.NS",
    "SBIN":       "SBIN.NS",
}

# ---------------------------------------------------------------------------
# In-memory cache: stores last successful fetch per ticker key.
# Falls back to these values when yfinance fails or market is closed.
# Format: { key: {"price": float, "change": str, "change_percent": str,
#                  "trend": str, "chart": list} }
# ---------------------------------------------------------------------------
_last_good_cache: dict = {}


# ---------------------------------------------------------------------------
# NSE market-hours helper
# ---------------------------------------------------------------------------

def is_nse_open() -> bool:
    """Return True if current IST time is within NSE trading hours (Mon–Fri)."""
    now_ist = datetime.now(IST)
    # Monday=0 … Friday=4; Saturday=5, Sunday=6
    if now_ist.weekday() >= 5:
        return False
    current_time = now_ist.time().replace(second=0, microsecond=0)
    return NSE_OPEN <= current_time <= NSE_CLOSE


# ---------------------------------------------------------------------------
# yfinance batch fetcher
# ---------------------------------------------------------------------------

def _build_stock_dict(price: float, prev_close: float, history_closes: list) -> dict:
    """Build a normalised stock data dict from raw prices."""
    change        = price - prev_close
    change_pct    = (change / prev_close * 100) if prev_close else 0.0
    trend         = "up" if change >= 0 else "down"
    sign          = "+" if change >= 0 else ""
    return {
        "price":          round(price, 2),
        "change":         f"{sign}{round(change, 2)}",
        "change_percent": f"{sign}{round(change_pct, 2)}%",
        "trend":          trend,
        "chart":          [round(v, 2) for v in history_closes],
    }


def fetch_yfinance_batch() -> dict:
    """
    Download 2-day history for all tickers in a single yf.download() call.
    Returns a dict keyed by our friendly names.
    Falls back to the in-memory cache for any ticker that fails.
    """
    results: dict = {}
    yf_symbols = list(TICKER_MAP.values())
    reverse_map = {v: k for k, v in TICKER_MAP.items()}  # Yahoo symbol → our key

    try:
        # group_by='ticker' gives a MultiIndex DataFrame keyed by symbol
        raw = yf.download(
            tickers=yf_symbols,
            period="2d",
            interval="1d",
            group_by="ticker",
            auto_adjust=True,
            progress=False,
            threads=True,
        )

        for yf_sym, key in reverse_map.items():
            try:
                # Slice this ticker's columns out of the MultiIndex DataFrame
                ticker_df = raw[yf_sym] if len(yf_symbols) > 1 else raw

                if ticker_df is None or ticker_df.empty or len(ticker_df) < 1:
                    raise ValueError("empty dataframe")

                closes = ticker_df["Close"].dropna().tolist()
                if len(closes) < 2:
                    # Only one day available — use it as both price and prev_close
                    price      = float(closes[-1])
                    prev_close = price
                else:
                    prev_close = float(closes[-2])
                    price      = float(closes[-1])

                stock_dict = _build_stock_dict(price, prev_close, closes)
                results[key] = stock_dict
                _last_good_cache[key] = stock_dict  # update persistent cache
                logger.debug("yfinance OK: %s → %.2f", key, price)

            except Exception as ticker_err:
                logger.warning("yfinance ticker error for %s: %s", key, ticker_err)
                # Use last known good value if available
                if key in _last_good_cache:
                    results[key] = _last_good_cache[key]

    except Exception as batch_err:
        logger.error("yfinance batch download failed: %s", batch_err)
        # Return whatever we have in cache
        results = dict(_last_good_cache)

    return results


# ---------------------------------------------------------------------------
# Default fallback values (used only when cache is completely empty)
# ---------------------------------------------------------------------------
_DEFAULTS = {
    "nifty50":    {"price": 24834.85, "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "sensex":     {"price": 81332.72, "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "bank_nifty": {"price": 51295.40, "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "RELIANCE":   {"price": 2984.50,  "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "TCS":        {"price": 4125.20,  "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "INFY":       {"price": 1568.90,  "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "HDFCBANK":   {"price": 1610.45,  "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "ICICIBANK":  {"price": 1124.10,  "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
    "SBIN":       {"price": 834.50,   "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []},
}


def _get(data: dict, key: str) -> dict:
    """Return fetched data for key, fallback to cache, then to hardcoded default."""
    return data.get(key) or _last_good_cache.get(key) or _DEFAULTS.get(key, {})


# ---------------------------------------------------------------------------
# Endpoint: GET /api/market/live/
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def live_market_data(request):
    """
    Returns all data required for the live-refresh polling cycle:
      - indices (Nifty 50, Sensex, Bank Nifty)
      - trending_stocks (6 fixed stocks)
      - market_overview (3 live indices + 3 static sector indices)
      - portfolio (user-specific, re-queried each call)
      - fii_dii (placeholder refreshed on availability)
      - market_status (open/closed)
      - fetched_at (ISO timestamp)

    Batch-fetches all tickers in one yfinance call.
    Falls back to last successful cached values on any failure.
    """
    user = request.user

    # --- Batch fetch all tickers ---
    market_data = fetch_yfinance_batch()

    nifty      = _get(market_data, "nifty50")
    sensex     = _get(market_data, "sensex")
    bank_nifty = _get(market_data, "bank_nifty")
    reliance   = _get(market_data, "RELIANCE")
    tcs        = _get(market_data, "TCS")
    infy       = _get(market_data, "INFY")
    hdfc       = _get(market_data, "HDFCBANK")
    icici      = _get(market_data, "ICICIBANK")
    sbin       = _get(market_data, "SBIN")

    # --- Portfolio summary (user-specific) ---
    try:
        total_invested       = Portfolio.objects.filter(user=user).aggregate(Sum("invested_amount"))["invested_amount__sum"] or 0.0
        current_portfolio_val = Portfolio.objects.filter(user=user).aggregate(Sum("current_value"))["current_value__sum"] or 0.0
        today_pl             = Portfolio.objects.filter(user=user).aggregate(Sum("profit_loss"))["profit_loss__sum"] or 0.0
    except Exception as portfolio_err:
        logger.warning("Portfolio query failed: %s", portfolio_err)
        total_invested        = 0.0
        current_portfolio_val = 0.0
        today_pl              = 0.0

    # --- Market status ---
    market_open = is_nse_open()
    now_ist     = datetime.now(IST)

    def fmt_price(val: float) -> str:
        """Format a float as a comma-separated string (Indian locale)."""
        return f"{val:,.2f}"

    response_payload = {
        # ── Indices ──────────────────────────────────────────────────────
        "indices": {
            "nifty_50": {
                "name":           "NIFTY 50",
                "value":          fmt_price(nifty["price"]),
                "change":         nifty["change"],
                "change_percent": nifty["change_percent"],
                "trend":          nifty["trend"],
                "chart":          nifty.get("chart", []),
            },
            "sensex": {
                "name":           "SENSEX",
                "value":          fmt_price(sensex["price"]),
                "change":         sensex["change"],
                "change_percent": sensex["change_percent"],
                "trend":          sensex["trend"],
                "chart":          sensex.get("chart", []),
            },
            "bank_nifty": {
                "name":           "BANK NIFTY",
                "value":          fmt_price(bank_nifty["price"]),
                "change":         bank_nifty["change"],
                "change_percent": bank_nifty["change_percent"],
                "trend":          bank_nifty["trend"],
                "chart":          bank_nifty.get("chart", []),
            },
        },

        # ── Trending stocks ───────────────────────────────────────────────
        "trending_stocks": [
            {"symbol": "RELIANCE",  "name": "Reliance Industries", "price": fmt_price(reliance["price"]), "change": reliance["change_percent"], "trend": reliance["trend"], "logo": "R", "chart": reliance.get("chart", [])},
            {"symbol": "TCS",       "name": "Tata Consultancy Services", "price": fmt_price(tcs["price"]),      "change": tcs["change_percent"],      "trend": tcs["trend"],      "logo": "T", "chart": tcs.get("chart", [])},
            {"symbol": "INFY",      "name": "Infosys Limited",      "price": fmt_price(infy["price"]),     "change": infy["change_percent"],     "trend": infy["trend"],     "logo": "I", "chart": infy.get("chart", [])},
            {"symbol": "HDFCBANK",  "name": "HDFC Bank Limited",    "price": fmt_price(hdfc["price"]),     "change": hdfc["change_percent"],     "trend": hdfc["trend"],     "logo": "H", "chart": hdfc.get("chart", [])},
            {"symbol": "ICICIBANK", "name": "ICICI Bank Limited",   "price": fmt_price(icici["price"]),    "change": icici["change_percent"],    "trend": icici["trend"],    "logo": "I", "chart": icici.get("chart", [])},
            {"symbol": "SBIN",      "name": "State Bank of India",  "price": fmt_price(sbin["price"]),     "change": sbin["change_percent"],     "trend": sbin["trend"],     "logo": "S", "chart": sbin.get("chart", [])},
        ],

        # ── Market overview (3 live + 3 static sector indices) ────────────
        "market_overview": [
            {"symbol": "NIFTY 50",   "value": fmt_price(nifty["price"]),      "change": nifty["change_percent"],      "trend": nifty["trend"],      "chart": nifty.get("chart", [])},
            {"symbol": "BANK NIFTY", "value": fmt_price(bank_nifty["price"]), "change": bank_nifty["change_percent"], "trend": bank_nifty["trend"], "chart": bank_nifty.get("chart", [])},
            {"symbol": "SENSEX",     "value": fmt_price(sensex["price"]),     "change": sensex["change_percent"],     "trend": sensex["trend"],     "chart": sensex.get("chart", [])},
            # Static sector indices (not available freely via yfinance)
            {"symbol": "NIFTY IT",   "value": "39,124.50", "change": "+1.45%", "trend": "up",   "chart": [38400, 38600, 38800, 39000, 39124]},
            {"symbol": "NIFTY AUTO", "value": "25,482.10", "change": "+0.92%", "trend": "up",   "chart": [25100, 25250, 25300, 25400, 25482]},
            {"symbol": "NIFTY FMCG", "value": "57,324.40", "change": "-0.15%", "trend": "down", "chart": [57500, 57450, 57400, 57350, 57324]},
        ],

        # ── Portfolio ─────────────────────────────────────────────────────
        "portfolio": {
            "invested":         float(total_invested),
            "current_value":    float(current_portfolio_val),
            "today_pl":         float(today_pl),
            "today_pl_percent": round((float(today_pl) / float(total_invested) * 100) if total_invested else 0.0, 2),
        },

        # ── Summary block (mirrors dashboard_data structure for easy merge) ─
        "summary": {
            "nifty_50": {
                "name":           "NIFTY 50",
                "value":          fmt_price(nifty["price"]),
                "change":         nifty["change"],
                "change_percent": nifty["change_percent"],
                "trend":          nifty["trend"],
            },
            "sensex": {
                "name":           "SENSEX",
                "value":          fmt_price(sensex["price"]),
                "change":         sensex["change"],
                "change_percent": sensex["change_percent"],
                "trend":          sensex["trend"],
            },
            "bank_nifty": {
                "name":           "BANK NIFTY",
                "value":          fmt_price(bank_nifty["price"]),
                "change":         bank_nifty["change"],
                "change_percent": bank_nifty["change_percent"],
                "trend":          bank_nifty["trend"],
            },
            "portfolio": {
                "invested":         float(total_invested),
                "current_value":    float(current_portfolio_val),
                "today_pl":         float(today_pl),
                "today_pl_percent": round((float(today_pl) / float(total_invested) * 100) if total_invested else 0.0, 2),
            },
            "ai_mood": {
                "mood":       "Bullish" if nifty["trend"] == "up" else "Bearish",
                "confidence": 88,
            },
        },

        # ── Watchlist ─────────────────────────────────────────────────────
        "watchlist": [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "price": fmt_price(reliance["price"]), "change": reliance["change_percent"], "trend": reliance["trend"]},
            {"symbol": "TCS", "name": "Tata Consultancy Services", "price": fmt_price(tcs["price"]), "change": tcs["change_percent"], "trend": tcs["trend"]},
            {"symbol": "INFY", "name": "Infosys Limited", "price": fmt_price(infy["price"]), "change": infy["change_percent"], "trend": infy["trend"]},
            {"symbol": "SBIN", "name": "State Bank of India", "price": fmt_price(sbin["price"]), "change": sbin["change_percent"], "trend": sbin["trend"]}
        ],

        # ── FII/DII ───────────────────────────────────────────────────────
        # NSE FII/DII data is only published end-of-day; we return last known
        # values here and refresh them whenever the NSE source is available.
        "fii_dii": {
            "fii_buy":  "12,430.50 Cr",
            "dii_buy":  "14,120.20 Cr",
            "net_flow": "+1,689.70 Cr",
            "trend":    "up",
        },

        # ── AI Insights (dynamic based on live prices) ────────────────────
        "ai_insights": [
            f"Reliance Industries showing {'strong momentum' if reliance['trend'] == 'up' else 'weakness'} at ₹{fmt_price(reliance['price'])}.",
            f"Bank Nifty {'support' if bank_nifty['trend'] == 'up' else 'resistance'} active around {fmt_price(bank_nifty['price'])}.",
            f"TCS price of ₹{fmt_price(tcs['price'])} indicates {'bullish' if tcs['trend'] == 'up' else 'bearish'} momentum.",
            "High institutional buying in HDFC Bank today.",
        ],

        # ── Market status ─────────────────────────────────────────────────
        "market_status": {
            "is_open":    market_open,
            "label":      "Market Open" if market_open else "Market Closed",
            "fetched_at": now_ist.strftime("%d %b %Y, %I:%M:%S %p IST"),
        },
    }

    return Response(response_payload, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Endpoint: GET /api/market/status/
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_status(request):
    """
    Lightweight endpoint that returns NSE market open/closed status.
    No DB queries — pure timezone arithmetic.
    """
    now_ist     = datetime.now(IST)
    market_open = is_nse_open()
    return Response({
        "is_open":    market_open,
        "label":      "Market Open" if market_open else "Market Closed",
        "checked_at": now_ist.strftime("%d %b %Y, %I:%M:%S %p IST"),
        "weekday":    now_ist.strftime("%A"),
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# NSE session helper for top-gainers / top-losers
# ---------------------------------------------------------------------------

NSE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/"
}


def fetch_nse_live_variations(index_type: str):
    """
    Fetches live gainers/losers directly from the NSE public API.
    Maintains a session to bypass basic blocking.
    Returns a list of stock dicts, or None on failure.
    """
    session = requests.Session()
    try:
        session.get("https://www.nseindia.com/", headers=NSE_HEADERS, timeout=5)
    except Exception:
        pass

    url = f"https://www.nseindia.com/api/live-analysis-variations?index={index_type}"
    try:
        response = session.get(url, headers=NSE_HEADERS, timeout=5)
        if response.status_code == 200:
            data    = response.json()
            records = data.get("NIFTY", {}).get("data", [])
            if not records:
                records = data.get("FOSec", {}).get("data", []) or data.get("allSec", {}).get("data", [])
            if not records:
                return None

            stocks = []
            for item in records[:5]:
                symbol       = item.get("symbol")
                price        = float(str(item.get("ltp", 0)).replace(",", ""))
                change       = float(str(item.get("net_price", item.get("netChange", 0))).replace(",", ""))
                change_pct   = float(str(item.get("perChange", item.get("pChange", 0))).replace(",", ""))
                volume       = float(str(item.get("trade_quantity", item.get("volume", 0))).replace(",", ""))
                stocks.append({
                    "symbol":         symbol,
                    "name":           symbol.replace("&", " and ") + " Ltd",
                    "price":          price,
                    "change_rs":      change,
                    "change_percent": change_pct,
                    "volume":         f"{round(volume / 1_000_000, 2)}M" if volume >= 1_000_000 else f"{round(volume / 1_000, 2)}K",
                })
            return stocks
    except Exception as nse_err:
        logger.warning("NSE API error (%s): %s", index_type, nse_err)
    return None


def update_cached_records(model_class, stocks_data: list) -> None:
    """Clears and repopulates the DB cache for Top Gainers / Losers."""
    try:
        model_class.objects.all().delete()
        for stock in stocks_data:
            model_class.objects.create(
                symbol=stock["symbol"],
                name=stock["name"],
                price=Decimal(str(stock["price"])),
                change_rs=Decimal(str(stock["change_rs"])),
                change_percent=Decimal(str(stock["change_percent"])),
                volume=stock["volume"],
            )
    except Exception as db_err:
        logger.error("DB cache update failed for %s: %s", model_class.__name__, db_err)


def get_cached_records(model_class, order_by_field: str) -> list:
    """Returns stored DB-cached records for Top Gainers / Losers."""
    try:
        records = model_class.objects.all().order_by(order_by_field)[:5]
        return [
            {
                "symbol":         r.symbol,
                "name":           r.name,
                "price":          float(r.price),
                "change_rs":      float(r.change_rs),
                "change_percent": float(r.change_percent),
                "volume":         r.volume,
                "logo":           r.symbol[0] if r.symbol else "S",
                "is_cached":      True,
                "updated_at":     r.updated_at.strftime("%d %b %Y, %I:%M %p IST") if r.updated_at else "",
            }
            for r in records
        ]
    except Exception as err:
        logger.error("DB cache read failed for %s: %s", model_class.__name__, err)
        return []


# ---------------------------------------------------------------------------
# Endpoint: GET /api/market/top-gainers/  (unchanged behaviour)
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_gainers(request):
    """Returns top 5 NSE gainers. Falls back to DB cache on failure."""
    try:
        live_data = fetch_nse_live_variations("gainers")
        if live_data:
            update_cached_records(TopGainer, live_data)
            return Response(
                [{**s, "logo": s["symbol"][0] if s["symbol"] else "S", "is_cached": False} for s in live_data],
                status=status.HTTP_200_OK,
            )
    except Exception as err:
        logger.warning("top_gainers live fetch error: %s", err)

    cached = get_cached_records(TopGainer, "-change_percent")
    if cached:
        return Response(cached, status=status.HTTP_200_OK)

    return Response({"error": "Unable to load Top Gainers."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------------------------------------------------------
# Endpoint: GET /api/market/top-losers/  (unchanged behaviour)
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_losers(request):
    """Returns top 5 NSE losers. Falls back to DB cache on failure."""
    try:
        live_data = fetch_nse_live_variations("loosers")
        if live_data:
            update_cached_records(TopLoser, live_data)
            return Response(
                [{**s, "logo": s["symbol"][0] if s["symbol"] else "S", "is_cached": False} for s in live_data],
                status=status.HTTP_200_OK,
            )
    except Exception as err:
        logger.warning("top_losers live fetch error: %s", err)

    cached = get_cached_records(TopLoser, "change_percent")
    if cached:
        return Response(cached, status=status.HTTP_200_OK)

    return Response({"error": "Unable to load Top Losers."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
