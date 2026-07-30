"""
apps/market/views.py
--------------------
All market-related API endpoints for StockSense.
This app is completely independent from the dashboard app.

Endpoints:
  Dashboard live-polling:
    GET /api/market/live/           → batch yfinance: indices + trending stocks
    GET /api/market/status/         → NSE open/closed (no DB queries)
    GET /api/market/top-gainers/    → top 5 NSE gainers (NSE API + DB fallback)
    GET /api/market/top-losers/     → top 5 NSE losers  (NSE API + DB fallback)

  Markets page:
    GET /api/market/indices/
    GET /api/market/sectors/
    GET /api/market/all-stocks/
    GET /api/market/gainers/
    GET /api/market/losers/
    GET /api/market/most-active/
    GET /api/market/high-volume/
    GET /api/market/heatmap/
    GET /api/market/market-breadth/
    GET /api/market/corporate-actions/
    GET /api/market/upcoming-ipos/
    GET /api/market/search/?q=
    GET /api/market/stock/<symbol>/
    GET /api/market/stock/<symbol>/history/?period=
"""

import logging
import math
import time
import requests
from datetime import datetime, time as dtime
from decimal import Decimal

import pytz
import yfinance as yf

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as drf_status
from django.db.models import Sum

from apps.users.models import Portfolio
from .models import TopGainerMarket, TopLoserMarket
from .services import MarketStatusService, NSEFetchService, MarketCacheService
from django.core.cache import cache

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Timezone & market hours
# ─────────────────────────────────────────────────────────────────────────────
IST       = pytz.timezone("Asia/Kolkata")
NSE_OPEN  = dtime(9, 15)
NSE_CLOSE = dtime(15, 30)


def is_nse_open() -> bool:
    now_ist = datetime.now(IST)
    if now_ist.weekday() >= 5:
        return False
    current = now_ist.time().replace(second=0, microsecond=0)
    return NSE_OPEN <= current <= NSE_CLOSE


# ─────────────────────────────────────────────────────────────────────────────
# In-memory caches
# ─────────────────────────────────────────────────────────────────────────────
_live_cache: dict   = {}   # last-good prices for Dashboard live endpoint
_mcache: dict       = {}   # (data, timestamp) pairs for Markets page endpoints

CACHE_TTL      = 30        # seconds — live data
CACHE_TTL_LONG = 300       # seconds — slower/static data


def _get_cache(key: str, ttl: int = CACHE_TTL):
    entry = _mcache.get(key)
    if entry and (time.time() - entry[1]) < ttl:
        return entry[0]
    return None


def _set_cache(key: str, data):
    _mcache[key] = (data, time.time())
    return data


# ─────────────────────────────────────────────────────────────────────────────
# Safe numeric helpers
# ─────────────────────────────────────────────────────────────────────────────

def _sf(val, default=0.0):
    """Safe float — handles NaN, Inf, None, strings."""
    try:
        v = float(val)
        return default if (math.isnan(v) or math.isinf(v)) else v
    except Exception:
        return default


def _sign(n: float) -> str:
    return "+" if n >= 0 else ""


def _fmt_vol(n: float) -> str:
    n = _sf(n)
    if n >= 1e7:  return f"{n/1e7:.2f} Cr"
    if n >= 1e5:  return f"{n/1e5:.2f} L"
    if n >= 1e3:  return f"{n/1e3:.2f} K"
    return str(int(n))


# ═════════════════════════════════════════════════════════════════════════════
# SECTION A — Dashboard Live Endpoints
# ═════════════════════════════════════════════════════════════════════════════

# ── Ticker map: friendly key → Yahoo Finance symbol ───────────────────────────
TICKER_MAP = {
    "nifty50":    "^NSEI",
    "sensex":     "^BSESN",
    "bank_nifty": "^NSEBANK",
    "RELIANCE":   "RELIANCE.NS",
    "TCS":        "TCS.NS",
    "INFY":       "INFY.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    "ICICIBANK":  "ICICIBANK.NS",
    "SBIN":       "SBIN.NS",
}

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


def _build_stock_dict(price: float, prev_close: float, closes: list) -> dict:
    change     = price - prev_close
    pct        = (change / prev_close * 100) if prev_close else 0.0
    sign       = "+" if change >= 0 else ""
    # Strip NaN from chart list
    clean_closes = [_sf(v) for v in closes if not (isinstance(v, float) and math.isnan(v))]
    return {
        "price":          round(price, 2),
        "change":         f"{sign}{round(change, 2)}",
        "change_percent": f"{sign}{round(pct, 2)}%",
        "trend":          "up" if change >= 0 else "down",
        "chart":          [round(v, 2) for v in clean_closes],
    }


def fetch_yfinance_batch() -> dict:
    """
    Single yf.download() call for all Dashboard tickers.
    Falls back to _live_cache on any per-ticker failure.
    """
    results: dict = {}
    yf_symbols    = list(TICKER_MAP.values())
    reverse_map   = {v: k for k, v in TICKER_MAP.items()}

    try:
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
                df = raw[yf_sym] if len(yf_symbols) > 1 else raw
                if df is None or df.empty:
                    raise ValueError("empty dataframe")
                closes = df["Close"].dropna().tolist()
                if len(closes) < 2:
                    price = prev = _sf(closes[-1]) if closes else 0.0
                else:
                    prev  = _sf(closes[-2])
                    price = _sf(closes[-1])
                d = _build_stock_dict(price, prev, closes)
                results[key] = d
                _live_cache[key] = d
            except Exception as e:
                logger.warning("Batch slice error %s: %s", key, e)
                if key in _live_cache:
                    results[key] = _live_cache[key]
    except Exception as e:
        logger.error("yfinance batch download failed: %s", e)
        results = dict(_live_cache)

    return results


def _get_live(data: dict, key: str) -> dict:
    return data.get(key) or _live_cache.get(key) or _DEFAULTS.get(key, {})


# ── GET /api/market/live/ ─────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def live_market_data(request):
    """All data for Dashboard's 12-second live-refresh cycle."""
    user        = request.user
    market_data = fetch_yfinance_batch()

    nifty      = _get_live(market_data, "nifty50")
    sensex     = _get_live(market_data, "sensex")
    bank_nifty = _get_live(market_data, "bank_nifty")
    reliance   = _get_live(market_data, "RELIANCE")
    tcs        = _get_live(market_data, "TCS")
    infy       = _get_live(market_data, "INFY")
    hdfc       = _get_live(market_data, "HDFCBANK")
    icici      = _get_live(market_data, "ICICIBANK")
    sbin       = _get_live(market_data, "SBIN")

    try:
        total_inv  = float(Portfolio.objects.filter(user=user).aggregate(Sum("invested_amount"))["invested_amount__sum"] or 0)
        cur_val    = float(Portfolio.objects.filter(user=user).aggregate(Sum("current_value"))["current_value__sum"] or 0)
        today_pl   = float(Portfolio.objects.filter(user=user).aggregate(Sum("profit_loss"))["profit_loss__sum"] or 0)
    except Exception as e:
        logger.warning("Portfolio query failed: %s", e)
        total_inv = cur_val = today_pl = 0.0

    market_open = is_nse_open()
    now_ist     = datetime.now(IST)
    fp          = lambda v: f"{v:,.2f}"

    return Response({
        "indices": {
            "nifty_50":   {"name": "NIFTY 50",   "value": fp(nifty["price"]),      "change": nifty["change"],      "change_percent": nifty["change_percent"],      "trend": nifty["trend"],      "chart": nifty.get("chart", [])},
            "sensex":     {"name": "SENSEX",      "value": fp(sensex["price"]),     "change": sensex["change"],     "change_percent": sensex["change_percent"],     "trend": sensex["trend"],     "chart": sensex.get("chart", [])},
            "bank_nifty": {"name": "BANK NIFTY",  "value": fp(bank_nifty["price"]), "change": bank_nifty["change"], "change_percent": bank_nifty["change_percent"], "trend": bank_nifty["trend"], "chart": bank_nifty.get("chart", [])},
        },
        "trending_stocks": [
            {"symbol": "RELIANCE",  "name": "Reliance Industries",      "price": fp(reliance["price"]), "change": reliance["change_percent"], "trend": reliance["trend"], "logo": "R", "chart": reliance.get("chart", [])},
            {"symbol": "TCS",       "name": "Tata Consultancy Services", "price": fp(tcs["price"]),      "change": tcs["change_percent"],      "trend": tcs["trend"],      "logo": "T", "chart": tcs.get("chart", [])},
            {"symbol": "INFY",      "name": "Infosys Limited",           "price": fp(infy["price"]),     "change": infy["change_percent"],     "trend": infy["trend"],     "logo": "I", "chart": infy.get("chart", [])},
            {"symbol": "HDFCBANK",  "name": "HDFC Bank Limited",         "price": fp(hdfc["price"]),     "change": hdfc["change_percent"],     "trend": hdfc["trend"],     "logo": "H", "chart": hdfc.get("chart", [])},
            {"symbol": "ICICIBANK", "name": "ICICI Bank Limited",        "price": fp(icici["price"]),    "change": icici["change_percent"],    "trend": icici["trend"],    "logo": "I", "chart": icici.get("chart", [])},
            {"symbol": "SBIN",      "name": "State Bank of India",       "price": fp(sbin["price"]),     "change": sbin["change_percent"],     "trend": sbin["trend"],     "logo": "S", "chart": sbin.get("chart", [])},
        ],
        "market_overview": [
            {"symbol": "NIFTY 50",   "value": fp(nifty["price"]),      "change": nifty["change_percent"],      "trend": nifty["trend"],      "chart": nifty.get("chart", [])},
            {"symbol": "BANK NIFTY", "value": fp(bank_nifty["price"]), "change": bank_nifty["change_percent"], "trend": bank_nifty["trend"], "chart": bank_nifty.get("chart", [])},
            {"symbol": "SENSEX",     "value": fp(sensex["price"]),     "change": sensex["change_percent"],     "trend": sensex["trend"],     "chart": sensex.get("chart", [])},
            {"symbol": "NIFTY IT",   "value": "39,124.50", "change": "+1.45%", "trend": "up",   "chart": [38400, 38600, 38800, 39000, 39124]},
            {"symbol": "NIFTY AUTO", "value": "25,482.10", "change": "+0.92%", "trend": "up",   "chart": [25100, 25250, 25300, 25400, 25482]},
            {"symbol": "NIFTY FMCG", "value": "57,324.40", "change": "-0.15%", "trend": "down", "chart": [57500, 57450, 57400, 57350, 57324]},
        ],
        "portfolio": {
            "invested": total_inv, "current_value": cur_val, "today_pl": today_pl,
            "today_pl_percent": round((today_pl / total_inv * 100) if total_inv else 0.0, 2),
        },
        "summary": {
            "nifty_50":   {"name": "NIFTY 50",   "value": fp(nifty["price"]),      "change": nifty["change"],      "change_percent": nifty["change_percent"],      "trend": nifty["trend"]},
            "sensex":     {"name": "SENSEX",      "value": fp(sensex["price"]),     "change": sensex["change"],     "change_percent": sensex["change_percent"],     "trend": sensex["trend"]},
            "bank_nifty": {"name": "BANK NIFTY",  "value": fp(bank_nifty["price"]), "change": bank_nifty["change"], "change_percent": bank_nifty["change_percent"], "trend": bank_nifty["trend"]},
            "portfolio": {"invested": total_inv, "current_value": cur_val, "today_pl": today_pl,
                          "today_pl_percent": round((today_pl / total_inv * 100) if total_inv else 0.0, 2)},
            "ai_mood": {"mood": "Bullish" if nifty["trend"] == "up" else "Bearish", "confidence": 88},
        },
        "fii_dii": {"fii_buy": "12,430.50 Cr", "dii_buy": "14,120.20 Cr", "net_flow": "+1,689.70 Cr", "trend": "up"},
        "ai_insights": [
            f"Reliance Industries showing {'strong momentum' if reliance['trend']=='up' else 'weakness'} at ₹{fp(reliance['price'])}.",
            f"Bank Nifty {'support' if bank_nifty['trend']=='up' else 'resistance'} active around {fp(bank_nifty['price'])}.",
            f"TCS price of ₹{fp(tcs['price'])} indicates {'bullish' if tcs['trend']=='up' else 'bearish'} momentum.",
            "High institutional buying in HDFC Bank today.",
        ],
        "market_status": {
            "is_open": market_open,
            "label": "Market Open" if market_open else "Market Closed",
            "fetched_at": now_ist.strftime("%d %b %Y, %I:%M:%S %p IST"),
        },
    }, status=drf_status.HTTP_200_OK)


# ── GET /api/market/status/ ──────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_status(request):
    """NSE open/closed — pure timezone arithmetic, no DB queries."""
    now_ist = datetime.now(IST)
    open_   = is_nse_open()
    return Response({
        "is_open":    open_,
        "label":      "Market Open" if open_ else "Market Closed",
        "checked_at": now_ist.strftime("%d %b %Y, %I:%M:%S %p IST"),
        "weekday":    now_ist.strftime("%A"),
    })


# ── NSE scraper helpers ───────────────────────────────────────────────────────
NSE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "*/*", "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/",
}


def _fetch_nse_variations(index_type: str):
    session = requests.Session()
    try:
        session.get("https://www.nseindia.com/", headers=NSE_HEADERS, timeout=5)
    except Exception:
        pass
    url = f"https://www.nseindia.com/api/live-analysis-variations?index={index_type}"
    try:
        resp = session.get(url, headers=NSE_HEADERS, timeout=5)
        if resp.status_code == 200:
            data    = resp.json()
            records = data.get("NIFTY", {}).get("data", [])
            if not records:
                records = data.get("FOSec", {}).get("data", []) or data.get("allSec", {}).get("data", [])
            if not records:
                return None
            stocks = []
            for item in records[:5]:
                sym  = item.get("symbol", "")
                p    = _sf(str(item.get("ltp", 0)).replace(",", ""))
                chg  = _sf(str(item.get("net_price", item.get("netChange", 0))).replace(",", ""))
                pct  = _sf(str(item.get("perChange", item.get("pChange", 0))).replace(",", ""))
                vol  = _sf(str(item.get("trade_quantity", item.get("volume", 0))).replace(",", ""))
                stocks.append({
                    "symbol": sym, "name": sym.replace("&", " and ") + " Ltd",
                    "price": p, "change_rs": chg, "change_percent": pct,
                    "volume": f"{vol/1_000_000:.2f}M" if vol >= 1_000_000 else f"{vol/1_000:.2f}K",
                })
            return stocks
    except Exception as e:
        logger.warning("NSE API error (%s): %s", index_type, e)
    return None


def _update_cached(model_cls, stocks: list):
    try:
        model_cls.objects.all().delete()
        for s in stocks:
            model_cls.objects.create(
                symbol=s["symbol"], name=s["name"],
                price=Decimal(str(s["price"])),
                change_rs=Decimal(str(s["change_rs"])),
                change_percent=Decimal(str(s["change_percent"])),
                volume=s["volume"],
            )
    except Exception as e:
        logger.error("DB cache update failed %s: %s", model_cls.__name__, e)


def _read_cached(model_cls, order_field: str) -> list:
    try:
        return [
            {"symbol": r.symbol, "name": r.name, "price": float(r.price),
             "change_rs": float(r.change_rs), "change_percent": float(r.change_percent),
             "volume": r.volume, "logo": r.symbol[0] if r.symbol else "S",
             "is_cached": True,
             "updated_at": r.updated_at.strftime("%d %b %Y, %I:%M %p IST") if r.updated_at else ""}
            for r in model_cls.objects.all().order_by(order_field)[:5]
        ]
    except Exception as e:
        logger.error("DB cache read failed %s: %s", model_cls.__name__, e)
        return []


# ── GET /api/market/top-gainers/ (Dashboard widget) ──────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_gainers(request):
    status = MarketStatusService.get_market_status()
    is_live = (status == "OPEN")
    
    data = None
    if status == "OPEN":
        data = cache.get(MarketCacheService.CACHE_KEY)
        if not data:
            try:
                data = NSEFetchService.fetch_gainers_and_losers()
                MarketCacheService.save_to_cache(data, "OPEN")
            except Exception as e:
                logger.error("NSE fetch failed in top_gainers, falling back to cache/db: %s", e)
                data = MarketCacheService.get_cached_data()
                is_live = False
    else:
        data = MarketCacheService.get_cached_data()
        is_live = False

    top_gainers_list = data.get("top_gainers") or []
    top_losers_list = data.get("top_losers") or []
    last_updated = data.get("last_updated") or ""

    return Response({
        "success": True,
        "is_live": is_live,
        "market_status": status,
        "last_updated": last_updated,
        "data": {
            "top_gainers": top_gainers_list,
            "top_losers": top_losers_list
        }
    })


# ── GET /api/market/top-losers/ (Dashboard widget) ───────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_losers(request):
    status = MarketStatusService.get_market_status()
    is_live = (status == "OPEN")
    
    data = None
    if status == "OPEN":
        data = cache.get(MarketCacheService.CACHE_KEY)
        if not data:
            try:
                data = NSEFetchService.fetch_gainers_and_losers()
                MarketCacheService.save_to_cache(data, "OPEN")
            except Exception as e:
                logger.error("NSE fetch failed in top_losers, falling back to cache/db: %s", e)
                data = MarketCacheService.get_cached_data()
                is_live = False
    else:
        data = MarketCacheService.get_cached_data()
        is_live = False

    top_gainers_list = data.get("top_gainers") or []
    top_losers_list = data.get("top_losers") or []
    last_updated = data.get("last_updated") or ""

    return Response({
        "success": True,
        "is_live": is_live,
        "market_status": status,
        "last_updated": last_updated,
        "data": {
            "top_gainers": top_gainers_list,
            "top_losers": top_losers_list
        }
    })


# ═════════════════════════════════════════════════════════════════════════════
# SECTION B — Markets Page Endpoints
# ═════════════════════════════════════════════════════════════════════════════

# ── NSE Stock Universe ────────────────────────────────────────────────────────
NSE_UNIVERSE = [
    ("HDFCBANK",   "HDFC Bank Limited",           "Banking",       "HDFCBANK.NS"),
    ("ICICIBANK",  "ICICI Bank Limited",           "Banking",       "ICICIBANK.NS"),
    ("AXISBANK",   "Axis Bank Limited",            "Banking",       "AXISBANK.NS"),
    ("KOTAKBANK",  "Kotak Mahindra Bank",          "Banking",       "KOTAKBANK.NS"),
    ("SBIN",       "State Bank of India",          "Banking",       "SBIN.NS"),
    ("BAJFINANCE", "Bajaj Finance Limited",        "Banking",       "BAJFINANCE.NS"),
    ("BANKBARODA", "Bank of Baroda",               "PSU Bank",      "BANKBARODA.NS"),
    ("PNB",        "Punjab National Bank",         "PSU Bank",      "PNB.NS"),
    ("CANBK",      "Canara Bank",                  "PSU Bank",      "CANBK.NS"),
    ("TCS",        "Tata Consultancy Services",    "IT",            "TCS.NS"),
    ("INFY",       "Infosys Limited",              "IT",            "INFY.NS"),
    ("WIPRO",      "Wipro Limited",                "IT",            "WIPRO.NS"),
    ("HCLTECH",    "HCL Technologies",             "IT",            "HCLTECH.NS"),
    ("TECHM",      "Tech Mahindra",                "IT",            "TECHM.NS"),
    ("LTIM",       "LTIMindtree Limited",          "IT",            "LTIM.NS"),
    ("TATAMOTORS", "Tata Motors Limited",          "Auto",          "TATAMOTORS.NS"),
    ("MARUTI",     "Maruti Suzuki India",          "Auto",          "MARUTI.NS"),
    ("BAJAJ-AUTO", "Bajaj Auto Limited",           "Auto",          "BAJAJ-AUTO.NS"),
    ("HEROMOTOCO", "Hero MotoCorp Limited",        "Auto",          "HEROMOTOCO.NS"),
    ("EICHERMOT",  "Eicher Motors Limited",        "Auto",          "EICHERMOT.NS"),
    ("SUNPHARMA",  "Sun Pharmaceutical",           "Pharma",        "SUNPHARMA.NS"),
    ("DRREDDY",    "Dr. Reddy's Laboratories",     "Pharma",        "DRREDDY.NS"),
    ("CIPLA",      "Cipla Limited",                "Pharma",        "CIPLA.NS"),
    ("DIVISLAB",   "Divi's Laboratories",          "Pharma",        "DIVISLAB.NS"),
    ("RELIANCE",   "Reliance Industries",          "Energy",        "RELIANCE.NS"),
    ("ONGC",       "Oil & Natural Gas Corp",       "Energy",        "ONGC.NS"),
    ("POWERGRID",  "Power Grid Corporation",       "Energy",        "POWERGRID.NS"),
    ("NTPC",       "NTPC Limited",                 "Energy",        "NTPC.NS"),
    ("ADANIENT",   "Adani Enterprises",            "Energy",        "ADANIENT.NS"),
    ("HINDUNILVR", "Hindustan Unilever",           "FMCG",          "HINDUNILVR.NS"),
    ("ITC",        "ITC Limited",                  "FMCG",          "ITC.NS"),
    ("NESTLEIND",  "Nestle India",                 "FMCG",          "NESTLEIND.NS"),
    ("BRITANNIA",  "Britannia Industries",         "FMCG",          "BRITANNIA.NS"),
    ("DLF",        "DLF Limited",                  "Realty",        "DLF.NS"),
    ("GODREJPROP", "Godrej Properties",            "Realty",        "GODREJPROP.NS"),
    ("TATASTEEL",  "Tata Steel Limited",           "Metal",         "TATASTEEL.NS"),
    ("JSWSTEEL",   "JSW Steel Limited",            "Metal",         "JSWSTEEL.NS"),
    ("HINDALCO",   "Hindalco Industries",          "Metal",         "HINDALCO.NS"),
    ("BHARTIARTL", "Bharti Airtel Limited",        "Telecom",       "BHARTIARTL.NS"),
    ("LT",         "Larsen & Toubro",              "Capital Goods", "LT.NS"),
]

APPROX_MKTCAP_CR = {
    "RELIANCE": 1900000, "TCS": 1350000, "HDFCBANK": 1200000, "ICICIBANK": 800000,
    "INFY": 600000, "SBIN": 700000, "KOTAKBANK": 400000, "BAJFINANCE": 450000,
    "AXISBANK": 350000, "LT": 480000, "BHARTIARTL": 850000, "HINDUNILVR": 550000,
    "ITC": 500000, "ADANIENT": 280000, "WIPRO": 250000, "HCLTECH": 380000,
    "MARUTI": 380000, "SUNPHARMA": 350000, "TATAMOTORS": 300000, "TECHM": 120000,
    "NTPC": 320000, "POWERGRID": 280000, "ONGC": 300000, "TATASTEEL": 180000,
    "JSWSTEEL": 220000, "HINDALCO": 160000, "DLF": 200000, "NESTLEIND": 200000,
    "BRITANNIA": 120000, "CIPLA": 130000, "DRREDDY": 140000, "DIVISLAB": 100000,
    "BAJAJ-AUTO": 220000, "HEROMOTOCO": 80000, "EICHERMOT": 130000, "LTIM": 130000,
    "CANBK": 90000, "PNB": 120000, "BANKBARODA": 110000, "GODREJPROP": 80000,
}

SEARCH_LIST = [(sym, name) for sym, name, _, _ in NSE_UNIVERSE] + [
    ("ZOMATO", "Zomato Limited"), ("PAYTM", "One97 Communications"),
    ("NYKAA", "FSN E-Commerce Ventures"), ("DMART", "Avenue Supermarts"),
    ("TATAPOWER", "Tata Power Company"), ("COALINDIA", "Coal India Limited"),
    ("VEDL", "Vedanta Limited"), ("BAJAJFINSV", "Bajaj Finserv"),
    ("TITAN", "Titan Company Limited"), ("ASIANPAINT", "Asian Paints Limited"),
    ("ULTRACEMCO", "UltraTech Cement"), ("M&M", "Mahindra & Mahindra"),
    ("GRASIM", "Grasim Industries"), ("BPCL", "Bharat Petroleum Corp"),
    ("INDUSINDBK", "IndusInd Bank"), ("FEDERALBNK", "The Federal Bank"),
    ("BIOCON", "Biocon Limited"), ("IRCTC", "Indian Railway Catering"),
    ("HAL", "Hindustan Aeronautics"), ("BEL", "Bharat Electronics"),
]


def _batch_fetch_market(yf_symbols: list) -> dict:
    """Batch OHLCV download for Markets page. Returns {yf_sym: data_dict}."""
    if not yf_symbols:
        return {}
    result = {}
    try:
        raw = yf.download(
            tickers=yf_symbols, period="2d", interval="1d",
            group_by="ticker", auto_adjust=True, progress=False, threads=True,
        )
        single = len(yf_symbols) == 1
        for sym in yf_symbols:
            try:
                df = raw if single else raw.get(sym)
                if df is None or df.empty:
                    continue
                df = df.dropna(subset=["Close"])
                if df.empty:
                    continue
                close  = _sf(df["Close"].iloc[-1])
                prev   = _sf(df["Close"].iloc[-2]) if len(df) >= 2 else close
                open_p = _sf(df["Open"].iloc[-1])
                high   = _sf(df["High"].iloc[-1])
                low    = _sf(df["Low"].iloc[-1])
                vol    = _sf(df["Volume"].iloc[-1])
                chg    = close - prev
                pct    = (chg / prev * 100) if prev else 0.0
                result[sym] = {
                    "close": round(close, 2), "prev_close": round(prev, 2),
                    "open": round(open_p, 2), "high": round(high, 2), "low": round(low, 2),
                    "volume": vol, "change": round(chg, 2), "change_pct": round(pct, 2),
                    "trend": "up" if chg >= 0 else "down",
                }
            except Exception as e:
                logger.debug("Batch slice %s: %s", sym, e)
    except Exception as e:
        logger.error("Market batch download: %s", e)
    return result


def _get_all_stocks() -> list:
    cached = _get_cache("all_stocks_raw")
    if cached:
        return cached
    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch_market(yf_syms)
    stocks = []
    for sym, name, sector, yf_sym in NSE_UNIVERSE:
        d          = raw.get(yf_sym, {})
        price      = d.get("close", 0)
        chg        = d.get("change", 0)
        pct        = d.get("change_pct", 0)
        vol        = d.get("volume", 0)
        mktcap_cr  = APPROX_MKTCAP_CR.get(sym, 50000)
        stocks.append({
            "symbol": sym, "name": name, "sector": sector,
            "price": round(price, 2), "price_fmt": f"{price:,.2f}",
            "change": round(chg, 2), "change_fmt": f"{_sign(chg)}{chg:,.2f}",
            "change_pct": round(pct, 2), "change_pct_fmt": f"{_sign(pct)}{pct:.2f}%",
            "trend": d.get("trend", "up"), "volume": _fmt_vol(vol),
            "mktcap_cr": mktcap_cr,
            "mktcap_fmt": f"₹{mktcap_cr/100000:.2f} L Cr" if mktcap_cr >= 100000 else f"₹{mktcap_cr:,} Cr",
            "high_52w": f"{price*1.25:,.2f}", "low_52w": f"{price*0.78:,.2f}",
            "logo": sym[0],
        })
    stocks.sort(key=lambda x: x["mktcap_cr"], reverse=True)
    return _set_cache("all_stocks_raw", stocks)


# ── GET /api/market/indices/ ─────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_indices(request):
    cached = _get_cache("m_indices")
    if cached:
        return Response(cached)
    index_map = {
        "^NSEI":     {"key": "nifty50",    "name": "NIFTY 50"},
        "^BSESN":    {"key": "sensex",     "name": "SENSEX"},
        "^NSEBANK":  {"key": "bank_nifty", "name": "BANK NIFTY"},
        "^INDIAVIX": {"key": "india_vix",  "name": "INDIA VIX"},
    }
    raw = _batch_fetch_market(list(index_map.keys()))
    indices = []
    for yf_sym, meta in index_map.items():
        d     = raw.get(yf_sym, {})
        price = d.get("close", 0)
        chg   = d.get("change", 0)
        pct   = d.get("change_pct", 0)
        indices.append({
            "key": meta["key"], "name": meta["name"],
            "price": f"{price:,.2f}", "price_raw": price,
            "change": f"{_sign(chg)}{chg:,.2f}", "change_pct": f"{_sign(pct)}{pct:.2f}%",
            "change_raw": round(pct, 2), "trend": d.get("trend", "up"),
            "open": f"{d.get('open',0):,.2f}", "high": f"{d.get('high',0):,.2f}",
            "low": f"{d.get('low',0):,.2f}", "prev_close": f"{d.get('prev_close',0):,.2f}",
        })
    return Response(_set_cache("m_indices", indices))


# ── GET /api/market/sectors/ ─────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_sectors(request):
    cached = _get_cache("sectors", ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)
    stocks = _get_all_stocks()
    sector_data: dict = {}
    for s in stocks:
        sec = s["sector"]
        if sec not in sector_data:
            sector_data[sec] = {"changes": [], "stocks": []}
        sector_data[sec]["changes"].append(s["change_pct"])
        sector_data[sec]["stocks"].append({"symbol": s["symbol"], "name": s["name"]})
    sectors = []
    for name, data in sector_data.items():
        avg = round(sum(data["changes"]) / len(data["changes"]), 2) if data["changes"] else 0.0
        sectors.append({
            "name": name, "change_pct": avg, "change_fmt": f"{_sign(avg)}{avg:.2f}%",
            "trend": "up" if avg >= 0 else "down",
            "stocks": data["stocks"][:10], "stock_count": len(data["stocks"]),
        })
    sectors.sort(key=lambda x: x["change_pct"], reverse=True)
    return Response(_set_cache("sectors", sectors))


# ── GET /api/market/all-stocks/ ──────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_all_stocks(request):
    return Response(_get_all_stocks())


# ── GET /api/market/gainers/ ─────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_gainers(request):
    stocks = _get_all_stocks()
    return Response(sorted(stocks, key=lambda x: x["change_pct"], reverse=True)[:8])


# ── GET /api/market/losers/ ──────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_losers(request):
    stocks = _get_all_stocks()
    return Response(sorted(stocks, key=lambda x: x["change_pct"])[:8])


# ── GET /api/market/most-active/ ─────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_most_active(request):
    stocks = _get_all_stocks()
    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch_market(yf_syms)
    sym_vol = {sym: raw.get(yfs, {}).get("volume", 0) for sym, _, _, yfs in NSE_UNIVERSE}
    return Response(sorted(stocks, key=lambda x: sym_vol.get(x["symbol"], 0), reverse=True)[:8])


# ── GET /api/market/high-volume/ ─────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_high_volume(request):
    stocks = _get_all_stocks()
    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch_market(yf_syms)
    sym_map = {sym: yfs for sym, _, _, yfs in NSE_UNIVERSE}
    def turnover(s):
        vol = raw.get(sym_map.get(s["symbol"], ""), {}).get("volume", 0)
        return s["price"] * vol
    return Response(sorted(stocks, key=turnover, reverse=True)[:8])


# ── GET /api/market/heatmap/ ─────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_heatmap(request):
    cached = _get_cache("heatmap")
    if cached:
        return Response(cached)
    stocks = _get_all_stocks()
    max_cap = max((s["mktcap_cr"] for s in stocks), default=1)
    heatmap = [{
        "symbol": s["symbol"], "name": s["name"], "sector": s["sector"],
        "price": s["price_fmt"], "change_pct": s["change_pct"], "change_fmt": s["change_pct_fmt"],
        "trend": s["trend"], "weight": max(1, round((s["mktcap_cr"] / max_cap) * 10)),
        "mktcap_cr": s["mktcap_cr"],
    } for s in stocks]
    return Response(_set_cache("heatmap", heatmap))


# ── GET /api/market/stock/<symbol>/ ──────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_detail(request, symbol: str):
    sym = symbol.upper()
    cached = _get_cache(f"detail_{sym}", ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)
    yf_sym = next((yfs for s, _, _, yfs in NSE_UNIVERSE if s == sym), f"{sym}.NS")
    name   = next((n for s, n, _, _ in NSE_UNIVERSE if s == sym), sym)
    sector = next((sec for s, _, sec, _ in NSE_UNIVERSE if s == sym), "—")
    try:
        ticker = yf.Ticker(yf_sym)
        fi     = ticker.fast_info
        hist   = ticker.history(period="2d", interval="1d")
        price  = _sf(fi.last_price)
        prev   = _sf(fi.previous_close)
        chg    = price - prev
        pct    = (chg / prev * 100) if prev else 0.0
        open_p = _sf(hist["Open"].iloc[-1])  if not hist.empty else price
        high   = _sf(hist["High"].iloc[-1])  if not hist.empty else price
        low    = _sf(hist["Low"].iloc[-1])   if not hist.empty else price
        data = {
            "symbol": sym, "name": name, "sector": sector, "logo": sym[0],
            "price": f"{price:,.2f}", "price_raw": round(price, 2),
            "change": f"{_sign(chg)}{chg:,.2f}", "change_pct": f"{_sign(pct)}{pct:.2f}%",
            "change_raw": round(pct, 2), "trend": "up" if chg >= 0 else "down",
            "open": f"{open_p:,.2f}", "high": f"{high:,.2f}", "low": f"{low:,.2f}",
            "prev_close": f"{prev:,.2f}",
            "high_52w": f"{_sf(fi.year_high):,.2f}", "low_52w": f"{_sf(fi.year_low):,.2f}",
            "volume": _fmt_vol(_sf(fi.three_month_average_volume)),
            "mktcap": f"₹{_sf(fi.market_cap)/1e7:.2f} Cr" if _sf(fi.market_cap) > 0 else "—",
            "pe_ratio": "—", "div_yield": "—",
        }
    except Exception as e:
        logger.warning("Stock detail %s: %s", sym, e)
        all_s = _mcache.get("all_stocks_raw", ([], 0))[0]
        found = next((s for s in all_s if s["symbol"] == sym), {})
        data = {
            "symbol": sym, "name": name, "sector": sector, "logo": sym[0],
            "price": found.get("price_fmt", "0.00"), "price_raw": found.get("price", 0),
            "change": found.get("change_fmt", "+0.00"), "change_pct": found.get("change_pct_fmt", "+0.00%"),
            "change_raw": found.get("change_pct", 0), "trend": found.get("trend", "up"),
            "open": "—", "high": "—", "low": "—", "prev_close": "—",
            "high_52w": "—", "low_52w": "—", "volume": found.get("volume", "—"),
            "mktcap": found.get("mktcap_fmt", "—"), "pe_ratio": "—", "div_yield": "—",
        }
    return Response(_set_cache(f"detail_{sym}", data))


# ── GET /api/market/stock/<symbol>/history/ ───────────────────────────────────
PERIOD_MAP = {
    "1d": ("1d", "5m"), "5d": ("5d", "30m"), "1mo": ("1mo", "1d"),
    "3mo": ("3mo", "1d"), "6mo": ("6mo", "1d"), "1y": ("1y", "1d"), "5y": ("5y", "1wk"),
}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_history(request, symbol: str):
    sym    = symbol.upper()
    period = request.query_params.get("period", "1mo")
    if period not in PERIOD_MAP:
        period = "1mo"
    cache_key = f"hist_{sym}_{period}"
    cached = _get_cache(cache_key, ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)
    yf_sym = next((yfs for s, _, _, yfs in NSE_UNIVERSE if s == sym), f"{sym}.NS")
    yf_period, yf_interval = PERIOD_MAP[period]
    try:
        hist = yf.Ticker(yf_sym).history(period=yf_period, interval=yf_interval, auto_adjust=True)
        if hist.empty:
            raise ValueError("empty")
        closes = [round(_sf(v), 2) for v in hist["Close"].tolist()]
        data = {
            "symbol": sym, "period": period,
            "closes": closes,
            "highs":  [round(_sf(v), 2) for v in hist["High"].tolist()],
            "lows":   [round(_sf(v), 2) for v in hist["Low"].tolist()],
            "timestamps": [str(i)[:16] for i in hist.index.tolist()],
            "min": min(closes) if closes else 0, "max": max(closes) if closes else 0,
        }
    except Exception as e:
        logger.warning("History %s %s: %s", sym, period, e)
        data = {"symbol": sym, "period": period, "closes": [], "highs": [], "lows": [], "timestamps": []}
    return Response(_set_cache(cache_key, data))


# ── GET /api/market/market-breadth/ ──────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_breadth(request):
    stocks    = _get_all_stocks()
    advancing = sum(1 for s in stocks if s["change_pct"] > 0.1)
    declining = sum(1 for s in stocks if s["change_pct"] < -0.1)
    unchanged = len(stocks) - advancing - declining
    ratio     = round(advancing / declining, 2) if declining else float(advancing)
    return Response({
        "advancing": advancing, "declining": declining, "unchanged": unchanged,
        "total": len(stocks), "ad_ratio": ratio, "ad_ratio_fmt": f"{ratio:.2f}",
        "bullish": advancing > declining,
    })


# ── GET /api/market/corporate-actions/ ───────────────────────────────────────
CORPORATE_ACTIONS = [
    {"company": "HDFC Bank",          "symbol": "HDFCBANK",   "action": "Dividend", "ex_date": "2025-07-18", "record_date": "2025-07-19", "details": "₹19.50 per share"},
    {"company": "TCS",                "symbol": "TCS",        "action": "Dividend", "ex_date": "2025-07-11", "record_date": "2025-07-12", "details": "₹28.00 per share"},
    {"company": "Infosys",            "symbol": "INFY",       "action": "Dividend", "ex_date": "2025-08-01", "record_date": "2025-08-02", "details": "₹21.00 per share"},
    {"company": "ITC",                "symbol": "ITC",        "action": "Dividend", "ex_date": "2025-07-22", "record_date": "2025-07-23", "details": "₹7.50 per share"},
    {"company": "Reliance Industries","symbol": "RELIANCE",   "action": "Bonus",    "ex_date": "2025-09-15", "record_date": "2025-09-16", "details": "1:1 Bonus Issue"},
    {"company": "Tata Motors",        "symbol": "TATAMOTORS", "action": "Split",    "ex_date": "2025-08-20", "record_date": "2025-08-21", "details": "2:1 Stock Split"},
    {"company": "Bajaj Finance",      "symbol": "BAJFINANCE", "action": "Dividend", "ex_date": "2025-07-29", "record_date": "2025-07-30", "details": "₹36.00 per share"},
    {"company": "Hindustan Unilever", "symbol": "HINDUNILVR", "action": "Dividend", "ex_date": "2025-08-05", "record_date": "2025-08-06", "details": "₹24.00 per share"},
    {"company": "Nestle India",       "symbol": "NESTLEIND",  "action": "Dividend", "ex_date": "2025-08-12", "record_date": "2025-08-13", "details": "₹140.00 per share"},
    {"company": "Sun Pharma",         "symbol": "SUNPHARMA",  "action": "Rights",   "ex_date": "2025-09-01", "record_date": "2025-09-02", "details": "1:5 @ ₹320"},
]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_corporate_actions(request):
    return Response(CORPORATE_ACTIONS)


# ── GET /api/market/upcoming-ipos/ ───────────────────────────────────────────
UPCOMING_IPOS = [
    {"name": "Ola Electric Mobility", "open": "2025-08-02", "close": "2025-08-06", "price_band": "₹72 – ₹76",       "lot": 195, "listing": "2025-08-09", "status": "Upcoming", "gmp": "+₹8"},
    {"name": "FirstCry (Brainbees)",  "open": "2025-08-05", "close": "2025-08-07", "price_band": "₹440 – ₹465",     "lot": 32,  "listing": "2025-08-12", "status": "Upcoming", "gmp": "+₹24"},
    {"name": "Bajaj Housing Finance", "open": "2025-08-09", "close": "2025-08-11", "price_band": "₹66 – ₹70",       "lot": 214, "listing": "2025-08-14", "status": "Upcoming", "gmp": "+₹12"},
    {"name": "Waaree Energies",       "open": "2025-07-21", "close": "2025-07-23", "price_band": "₹1,427 – ₹1,503", "lot": 9,   "listing": "2025-07-26", "status": "Listed",   "gmp": "+₹95"},
    {"name": "NTPC Green Energy",     "open": "2025-07-19", "close": "2025-07-23", "price_band": "₹102 – ₹108",     "lot": 138, "listing": "2025-07-26", "status": "Listed",   "gmp": "+₹6"},
    {"name": "Hyundai India",         "open": "2025-06-15", "close": "2025-06-17", "price_band": "₹1,865 – ₹1,960", "lot": 7,   "listing": "2025-06-22", "status": "Listed",   "gmp": "+₹45"},
    {"name": "Swiggy",                "open": "2025-05-06", "close": "2025-05-08", "price_band": "₹371 – ₹390",     "lot": 38,  "listing": "2025-05-13", "status": "Listed",   "gmp": "+₹22"},
]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_upcoming_ipos(request):
    return Response(UPCOMING_IPOS)


# ── GET /api/market/search/?q= ───────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_search(request):
    q = request.query_params.get("q", "").strip().upper()
    if not q:
        return Response([])
    matches = []
    for sym, name in SEARCH_LIST:
        if q in sym.upper() or q in name.upper():
            matches.append({"symbol": sym, "name": name})
        if len(matches) >= 8:
            break
    return Response(matches)
