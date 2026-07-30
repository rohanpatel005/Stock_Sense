"""
markets_views.py
----------------
Backend API handlers for the StockSense Markets page.
12 endpoints powering all sections of the Markets UI.

All live data is sourced from yfinance with in-memory fallback caching (30s TTL).
Corporate actions and IPO data use structured placeholder responses that can be
swapped for live NSE/BSE API data without any frontend changes.
"""

import logging
import time
import pytz
from datetime import datetime

import yfinance as yf
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as drf_status

logger = logging.getLogger(__name__)
IST = pytz.timezone("Asia/Kolkata")

# ─────────────────────────────────────────────────────────────────────────────
# NSE Stock Universe  (symbol, display_name, sector, yf_symbol)
# ─────────────────────────────────────────────────────────────────────────────
NSE_UNIVERSE = [
    # Banking
    ("HDFCBANK",   "HDFC Bank Limited",           "Banking",       "HDFCBANK.NS"),
    ("ICICIBANK",  "ICICI Bank Limited",           "Banking",       "ICICIBANK.NS"),
    ("AXISBANK",   "Axis Bank Limited",            "Banking",       "AXISBANK.NS"),
    ("KOTAKBANK",  "Kotak Mahindra Bank",          "Banking",       "KOTAKBANK.NS"),
    ("SBIN",       "State Bank of India",          "Banking",       "SBIN.NS"),
    ("BAJFINANCE", "Bajaj Finance Limited",        "Banking",       "BAJFINANCE.NS"),
    # PSU Bank
    ("BANKBARODA", "Bank of Baroda",               "PSU Bank",      "BANKBARODA.NS"),
    ("PNB",        "Punjab National Bank",         "PSU Bank",      "PNB.NS"),
    ("CANBK",      "Canara Bank",                  "PSU Bank",      "CANBK.NS"),
    # IT
    ("TCS",        "Tata Consultancy Services",    "IT",            "TCS.NS"),
    ("INFY",       "Infosys Limited",              "IT",            "INFY.NS"),
    ("WIPRO",      "Wipro Limited",                "IT",            "WIPRO.NS"),
    ("HCLTECH",    "HCL Technologies",             "IT",            "HCLTECH.NS"),
    ("TECHM",      "Tech Mahindra",                "IT",            "TECHM.NS"),
    ("LTIM",       "LTIMindtree Limited",          "IT",            "LTIM.NS"),
    # Auto
    ("TATAMOTORS", "Tata Motors Limited",          "Auto",          "TATAMOTORS.NS"),
    ("MARUTI",     "Maruti Suzuki India",          "Auto",          "MARUTI.NS"),
    ("BAJAJ-AUTO", "Bajaj Auto Limited",           "Auto",          "BAJAJ-AUTO.NS"),
    ("HEROMOTOCO", "Hero MotoCorp Limited",        "Auto",          "HEROMOTOCO.NS"),
    ("EICHERMOT",  "Eicher Motors Limited",        "Auto",          "EICHERMOT.NS"),
    # Pharma
    ("SUNPHARMA",  "Sun Pharmaceutical",           "Pharma",        "SUNPHARMA.NS"),
    ("DRREDDY",    "Dr. Reddy's Laboratories",     "Pharma",        "DRREDDY.NS"),
    ("CIPLA",      "Cipla Limited",                "Pharma",        "CIPLA.NS"),
    ("DIVISLAB",   "Divi's Laboratories",          "Pharma",        "DIVISLAB.NS"),
    # Energy
    ("RELIANCE",   "Reliance Industries",          "Energy",        "RELIANCE.NS"),
    ("ONGC",       "Oil & Natural Gas Corp",       "Energy",        "ONGC.NS"),
    ("POWERGRID",  "Power Grid Corporation",       "Energy",        "POWERGRID.NS"),
    ("NTPC",       "NTPC Limited",                 "Energy",        "NTPC.NS"),
    ("ADANIENT",   "Adani Enterprises",            "Energy",        "ADANIENT.NS"),
    # FMCG
    ("HINDUNILVR", "Hindustan Unilever",           "FMCG",          "HINDUNILVR.NS"),
    ("ITC",        "ITC Limited",                  "FMCG",          "ITC.NS"),
    ("NESTLEIND",  "Nestle India",                 "FMCG",          "NESTLEIND.NS"),
    ("BRITANNIA",  "Britannia Industries",         "FMCG",          "BRITANNIA.NS"),
    # Realty
    ("DLF",        "DLF Limited",                  "Realty",        "DLF.NS"),
    ("GODREJPROP", "Godrej Properties",            "Realty",        "GODREJPROP.NS"),
    # Metal
    ("TATASTEEL",  "Tata Steel Limited",           "Metal",         "TATASTEEL.NS"),
    ("JSWSTEEL",   "JSW Steel Limited",            "Metal",         "JSWSTEEL.NS"),
    ("HINDALCO",   "Hindalco Industries",          "Metal",         "HINDALCO.NS"),
    # Telecom
    ("BHARTIARTL", "Bharti Airtel Limited",        "Telecom",       "BHARTIARTL.NS"),
    # Capital Goods
    ("LT",         "Larsen & Toubro",              "Capital Goods", "LT.NS"),
]

# Approximate market caps in Crores (used as fallback when yfinance is slow)
APPROX_MKTCAP_CR = {
    "RELIANCE": 1900000, "TCS": 1350000, "HDFCBANK": 1200000,
    "ICICIBANK": 800000,  "INFY": 600000,  "SBIN": 700000,
    "KOTAKBANK": 400000,  "BAJFINANCE": 450000, "AXISBANK": 350000,
    "LT": 480000, "BHARTIARTL": 850000, "HINDUNILVR": 550000,
    "ITC": 500000, "ADANIENT": 280000, "WIPRO": 250000,
    "HCLTECH": 380000, "MARUTI": 380000, "SUNPHARMA": 350000,
    "TATAMOTORS": 300000, "TECHM": 120000, "NTPC": 320000,
    "POWERGRID": 280000, "ONGC": 300000, "TATASTEEL": 180000,
    "JSWSTEEL": 220000, "HINDALCO": 160000, "DLF": 200000,
    "NESTLEIND": 200000, "BRITANNIA": 120000, "CIPLA": 130000,
    "DRREDDY": 140000, "DIVISLAB": 100000, "BAJAJ-AUTO": 220000,
    "HEROMOTOCO": 80000, "EICHERMOT": 130000, "LTIM": 130000,
    "KOTAKBANK": 400000, "CANBK": 90000, "PNB": 120000,
    "BANKBARODA": 110000, "GODREJPROP": 80000,
}

# Extended search list
SEARCH_LIST = [
    (sym, name) for sym, name, _, _ in NSE_UNIVERSE
] + [
    ("ZOMATO",    "Zomato Limited"),
    ("PAYTM",     "One97 Communications"),
    ("NYKAA",     "FSN E-Commerce Ventures"),
    ("DMART",     "Avenue Supermarts"),
    ("TATAPOWER", "Tata Power Company"),
    ("COALINDIA", "Coal India Limited"),
    ("VEDL",      "Vedanta Limited"),
    ("BAJAJFINSV","Bajaj Finserv"),
    ("TITAN",     "Titan Company Limited"),
    ("ASIANPAINT","Asian Paints Limited"),
    ("ULTRACEMCO","UltraTech Cement"),
    ("M&M",       "Mahindra & Mahindra"),
    ("GRASIM",    "Grasim Industries"),
    ("BPCL",      "Bharat Petroleum Corp"),
    ("INDUSINDBK","IndusInd Bank"),
    ("FEDERALBNK","The Federal Bank"),
    ("IDFCFIRSTB","IDFC First Bank"),
    ("AUBANK",    "AU Small Finance Bank"),
    ("BIOCON",    "Biocon Limited"),
    ("TORNTPHARM","Torrent Pharmaceuticals"),
    ("APOLLOHOSP","Apollo Hospitals"),
    ("FORTIS",    "Fortis Healthcare"),
    ("MAXHEALTH", "Max Healthcare"),
    ("IRCTC",     "Indian Railway Catering"),
    ("HAL",       "Hindustan Aeronautics"),
    ("BEL",       "Bharat Electronics"),
    ("SIEMENS",   "Siemens Limited"),
    ("ABB",       "ABB India Limited"),
    ("HAVELLS",   "Havells India"),
    ("DIXON",     "Dixon Technologies"),
]

# ─────────────────────────────────────────────────────────────────────────────
# In-memory cache  { key: (data, timestamp) }
# ─────────────────────────────────────────────────────────────────────────────
_mcache: dict = {}
CACHE_TTL = 30        # seconds — live data
CACHE_TTL_LONG = 300  # seconds — slow/static data


def _get_cache(key: str, ttl: int = CACHE_TTL):
    entry = _mcache.get(key)
    if entry and (time.time() - entry[1]) < ttl:
        return entry[0]
    return None


def _set_cache(key: str, data):
    _mcache[key] = (data, time.time())
    return data


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _sf(val, default=0.0):
    """Safe float — handles NaN, None, strings."""
    try:
        v = float(val)
        return default if v != v else v  # NaN check
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


def _fmt_mktcap(n: float) -> str:
    n = _sf(n)
    if n >= 1e12: return f"₹{n/1e7:.0f} Cr"  # already in INR
    if n >= 1e9:  return f"₹{n/1e9:.2f} B"
    return f"₹{n:.0f}"


def _batch_fetch(yf_symbols: list) -> dict:
    """
    Batch-download 2-day OHLCV for given Yahoo Finance symbols.
    Returns dict: yf_symbol → price data dict.
    Uses thread-safe yf.download() with group_by='ticker'.
    """
    if not yf_symbols:
        return {}
    result = {}
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
        single = len(yf_symbols) == 1
        for sym in yf_symbols:
            try:
                df = raw if single else raw.get(sym)
                if df is None or df.empty:
                    continue
                df = df.dropna(subset=["Close"])
                if df.empty:
                    continue

                close    = _sf(df["Close"].iloc[-1])
                prev     = _sf(df["Close"].iloc[-2]) if len(df) >= 2 else close
                open_p   = _sf(df["Open"].iloc[-1])
                high     = _sf(df["High"].iloc[-1])
                low      = _sf(df["Low"].iloc[-1])
                vol      = _sf(df["Volume"].iloc[-1])
                change   = close - prev
                pct      = (change / prev * 100) if prev else 0.0

                result[sym] = {
                    "close":      round(close, 2),
                    "prev_close": round(prev, 2),
                    "open":       round(open_p, 2),
                    "high":       round(high, 2),
                    "low":        round(low, 2),
                    "volume":     vol,
                    "change":     round(change, 2),
                    "change_pct": round(pct, 2),
                    "trend":      "up" if change >= 0 else "down",
                }
            except Exception as e:
                logger.debug("Batch slice error %s: %s", sym, e)
    except Exception as e:
        logger.error("Batch download error: %s", e)
    return result


def _get_all_stocks_data() -> list:
    """
    Fetch price data for all stocks in NSE_UNIVERSE.
    Cached for CACHE_TTL seconds.
    Returns list of stock dicts sorted by market cap desc.
    """
    cached = _get_cache("all_stocks_raw")
    if cached:
        return cached

    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch(yf_syms)

    stocks = []
    for sym, name, sector, yf_sym in NSE_UNIVERSE:
        d = raw.get(yf_sym, {})
        price      = d.get("close", 0)
        change     = d.get("change", 0)
        pct        = d.get("change_pct", 0)
        vol        = d.get("volume", 0)
        mktcap_cr  = APPROX_MKTCAP_CR.get(sym, 50000)

        # Approximate 52w high/low from 2-day data (placeholder — real data in stock detail)
        high52 = round(price * 1.25, 2) if price else 0
        low52  = round(price * 0.78, 2) if price else 0

        stocks.append({
            "symbol":     sym,
            "name":       name,
            "sector":     sector,
            "price":      round(price, 2),
            "price_fmt":  f"{price:,.2f}",
            "change":     round(change, 2),
            "change_fmt": f"{_sign(change)}{change:,.2f}",
            "change_pct": round(pct, 2),
            "change_pct_fmt": f"{_sign(pct)}{pct:.2f}%",
            "trend":      d.get("trend", "up"),
            "volume":     _fmt_vol(vol),
            "mktcap_cr":  mktcap_cr,
            "mktcap_fmt": f"₹{mktcap_cr/100000:.2f} L Cr" if mktcap_cr >= 100000 else f"₹{mktcap_cr:,} Cr",
            "high_52w":   f"{high52:,.2f}",
            "low_52w":    f"{low52:,.2f}",
            "logo":       sym[0],
        })

    # Sort by market cap descending
    stocks.sort(key=lambda x: x["mktcap_cr"], reverse=True)
    return _set_cache("all_stocks_raw", stocks)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/indices/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_indices(request):
    """Returns OHLC data for Nifty 50, Sensex, Bank Nifty, India VIX."""
    cached = _get_cache("indices")
    if cached:
        return Response(cached)

    index_map = {
        "^NSEI":     {"key": "nifty50",    "name": "NIFTY 50"},
        "^BSESN":    {"key": "sensex",     "name": "SENSEX"},
        "^NSEBANK":  {"key": "bank_nifty", "name": "BANK NIFTY"},
        "^INDIAVIX": {"key": "india_vix",  "name": "INDIA VIX"},
    }
    raw = _batch_fetch(list(index_map.keys()))

    indices = []
    for yf_sym, meta in index_map.items():
        d = raw.get(yf_sym, {})
        price = d.get("close", 0)
        chg   = d.get("change", 0)
        pct   = d.get("change_pct", 0)
        indices.append({
            "key":         meta["key"],
            "name":        meta["name"],
            "price":       f"{price:,.2f}",
            "price_raw":   price,
            "change":      f"{_sign(chg)}{chg:,.2f}",
            "change_pct":  f"{_sign(pct)}{pct:.2f}%",
            "change_raw":  round(pct, 2),
            "trend":       d.get("trend", "up"),
            "open":        f"{d.get('open', 0):,.2f}",
            "high":        f"{d.get('high', 0):,.2f}",
            "low":         f"{d.get('low', 0):,.2f}",
            "prev_close":  f"{d.get('prev_close', 0):,.2f}",
        })

    return Response(_set_cache("indices", indices))


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/sectors/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_sectors(request):
    """
    Returns sector performance derived from NSE_UNIVERSE stocks.
    Uses the average % change of constituent stocks per sector.
    """
    cached = _get_cache("sectors", ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)

    stocks = _get_all_stocks_data()

    # Group by sector
    sector_data: dict = {}
    for s in stocks:
        sec = s["sector"]
        if sec not in sector_data:
            sector_data[sec] = {"changes": [], "stocks": []}
        sector_data[sec]["changes"].append(s["change_pct"])
        sector_data[sec]["stocks"].append({"symbol": s["symbol"], "name": s["name"]})

    sectors = []
    for sec_name, data in sector_data.items():
        changes = data["changes"]
        avg_chg = round(sum(changes) / len(changes), 2) if changes else 0.0
        sectors.append({
            "name":        sec_name,
            "change_pct":  avg_chg,
            "change_fmt":  f"{_sign(avg_chg)}{avg_chg:.2f}%",
            "trend":       "up" if avg_chg >= 0 else "down",
            "stocks":      data["stocks"][:10],
            "stock_count": len(data["stocks"]),
        })

    sectors.sort(key=lambda x: x["change_pct"], reverse=True)
    return Response(_set_cache("sectors", sectors, ))


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/all-stocks/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_all_stocks(request):
    """Returns all stocks in NSE_UNIVERSE with live price data."""
    stocks = _get_all_stocks_data()
    return Response(stocks)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/top-gainers/  (Markets page version)
# Endpoint: GET /api/market/top-losers/   (Markets page version)
# Endpoint: GET /api/market/most-active/
# Endpoint: GET /api/market/high-volume/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_top_gainers(request):
    """Top 8 gainers from NSE_UNIVERSE by % change."""
    stocks = _get_all_stocks_data()
    gainers = sorted(stocks, key=lambda x: x["change_pct"], reverse=True)[:8]
    return Response(gainers)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_top_losers(request):
    """Top 8 losers from NSE_UNIVERSE by % change."""
    stocks = _get_all_stocks_data()
    losers = sorted(stocks, key=lambda x: x["change_pct"])[:8]
    return Response(losers)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_most_active(request):
    """Top 8 most active stocks by trade volume."""
    stocks = _get_all_stocks_data()
    # Re-sort by raw volume (need to fetch raw)
    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch(yf_syms)
    sym_vol = {sym: raw.get(yfs, {}).get("volume", 0) for sym, _, _, yfs in NSE_UNIVERSE}
    active = sorted(stocks, key=lambda x: sym_vol.get(x["symbol"], 0), reverse=True)[:8]
    return Response(active)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_high_volume(request):
    """Top 8 stocks by turnover (price × volume)."""
    stocks = _get_all_stocks_data()
    yf_syms = [yfs for _, _, _, yfs in NSE_UNIVERSE]
    raw = _batch_fetch(yf_syms)
    sym_map = {sym: yfs for sym, _, _, yfs in NSE_UNIVERSE}
    def turnover(s):
        vol = raw.get(sym_map.get(s["symbol"], ""), {}).get("volume", 0)
        return s["price"] * vol
    high_vol = sorted(stocks, key=turnover, reverse=True)[:8]
    return Response(high_vol)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/heatmap/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_heatmap(request):
    """
    Returns stocks for heatmap with weight (mktcap_cr) and % change.
    Rectangle size on frontend is proportional to mktcap_cr.
    """
    cached = _get_cache("heatmap")
    if cached:
        return Response(cached)

    stocks = _get_all_stocks_data()
    # Normalize weights 1-10 for rectangle sizing
    max_cap = max((s["mktcap_cr"] for s in stocks), default=1)
    heatmap = []
    for s in stocks:
        weight = max(1, round((s["mktcap_cr"] / max_cap) * 10))
        heatmap.append({
            "symbol":     s["symbol"],
            "name":       s["name"],
            "sector":     s["sector"],
            "price":      s["price_fmt"],
            "change_pct": s["change_pct"],
            "change_fmt": s["change_pct_fmt"],
            "trend":      s["trend"],
            "weight":     weight,
            "mktcap_cr":  s["mktcap_cr"],
        })

    return Response(_set_cache("heatmap", heatmap))


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/stock/<symbol>/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_detail(request, symbol: str):
    """
    Returns full stock details for the drawer panel.
    Uses yf.Ticker.info for extended fields (slower; cached 5 min).
    """
    sym_upper = symbol.upper()
    cache_key = f"stock_detail_{sym_upper}"
    cached = _get_cache(cache_key, ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)

    # Find yfinance symbol
    yf_sym = next((yfs for s, _, _, yfs in NSE_UNIVERSE if s == sym_upper), f"{sym_upper}.NS")
    name   = next((n for s, n, _, _ in NSE_UNIVERSE if s == sym_upper), sym_upper)
    sector = next((sec for s, _, sec, _ in NSE_UNIVERSE if s == sym_upper), "—")

    try:
        ticker = yf.Ticker(yf_sym)
        info   = ticker.fast_info
        hist   = ticker.history(period="2d", interval="1d")

        price      = _sf(info.last_price)
        prev_close = _sf(info.previous_close)
        change     = price - prev_close
        pct        = (change / prev_close * 100) if prev_close else 0.0
        high52     = _sf(info.year_high)
        low52      = _sf(info.year_low)
        mktcap     = _sf(info.market_cap)
        vol        = _sf(info.three_month_average_volume)

        open_p = _sf(hist["Open"].iloc[-1])  if not hist.empty else price
        high   = _sf(hist["High"].iloc[-1])  if not hist.empty else price
        low    = _sf(hist["Low"].iloc[-1])   if not hist.empty else price

        data = {
            "symbol":      sym_upper,
            "name":        name,
            "sector":      sector,
            "price":       f"{price:,.2f}",
            "price_raw":   round(price, 2),
            "change":      f"{_sign(change)}{change:,.2f}",
            "change_pct":  f"{_sign(pct)}{pct:.2f}%",
            "change_raw":  round(pct, 2),
            "trend":       "up" if change >= 0 else "down",
            "open":        f"{open_p:,.2f}",
            "high":        f"{high:,.2f}",
            "low":         f"{low:,.2f}",
            "prev_close":  f"{prev_close:,.2f}",
            "high_52w":    f"{high52:,.2f}",
            "low_52w":     f"{low52:,.2f}",
            "volume":      _fmt_vol(vol),
            "mktcap":      f"₹{mktcap/1e7:.2f} Cr" if mktcap > 0 else "—",
            "pe_ratio":    "—",   # fast_info doesn't include P/E
            "div_yield":   "—",
            "logo":        sym_upper[0],
        }

    except Exception as e:
        logger.warning("Stock detail failed for %s: %s", sym_upper, e)
        # Minimal fallback from all_stocks cache
        all_stocks = _mcache.get("all_stocks_raw", ([], 0))[0]
        found = next((s for s in all_stocks if s["symbol"] == sym_upper), {})
        data = {
            "symbol":     sym_upper,
            "name":       name,
            "sector":     sector,
            "price":      found.get("price_fmt", "0.00"),
            "price_raw":  found.get("price", 0),
            "change":     found.get("change_fmt", "+0.00"),
            "change_pct": found.get("change_pct_fmt", "+0.00%"),
            "change_raw": found.get("change_pct", 0),
            "trend":      found.get("trend", "up"),
            "open":       "—", "high": "—", "low": "—",
            "prev_close": "—", "high_52w": "—", "low_52w": "—",
            "volume":     found.get("volume", "—"),
            "mktcap":     found.get("mktcap_fmt", "—"),
            "pe_ratio":   "—", "div_yield": "—",
            "logo":       sym_upper[0],
        }

    return Response(_set_cache(cache_key, data))


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/stock/<symbol>/history/?period=1d
# ─────────────────────────────────────────────────────────────────────────────

PERIOD_MAP = {
    "1d":  ("1d",  "5m"),
    "5d":  ("5d",  "30m"),
    "1mo": ("1mo", "1d"),
    "3mo": ("3mo", "1d"),
    "6mo": ("6mo", "1d"),
    "1y":  ("1y",  "1d"),
    "5y":  ("5y",  "1wk"),
}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_stock_history(request, symbol: str):
    """Returns OHLC history for price chart inside the stock detail drawer."""
    sym_upper = symbol.upper()
    period    = request.query_params.get("period", "1mo")
    if period not in PERIOD_MAP:
        period = "1mo"

    cache_key = f"stock_hist_{sym_upper}_{period}"
    cached = _get_cache(cache_key, ttl=CACHE_TTL_LONG)
    if cached:
        return Response(cached)

    yf_sym = next((yfs for s, _, _, yfs in NSE_UNIVERSE if s == sym_upper), f"{sym_upper}.NS")
    yf_period, yf_interval = PERIOD_MAP[period]

    try:
        ticker = yf.Ticker(yf_sym)
        hist   = ticker.history(period=yf_period, interval=yf_interval, auto_adjust=True)

        if hist.empty:
            raise ValueError("empty history")

        closes     = [round(_sf(v), 2) for v in hist["Close"].tolist()]
        highs      = [round(_sf(v), 2) for v in hist["High"].tolist()]
        lows       = [round(_sf(v), 2) for v in hist["Low"].tolist()]
        timestamps = [str(idx)[:16] for idx in hist.index.tolist()]

        data = {
            "symbol":     sym_upper,
            "period":     period,
            "closes":     closes,
            "highs":      highs,
            "lows":       lows,
            "timestamps": timestamps,
            "min":        min(lows) if lows else 0,
            "max":        max(highs) if highs else 0,
        }
    except Exception as e:
        logger.warning("History failed %s %s: %s", sym_upper, period, e)
        data = {"symbol": sym_upper, "period": period, "closes": [], "highs": [], "lows": [], "timestamps": []}

    return Response(_set_cache(cache_key, data))


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/market-breadth/
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_breadth(request):
    """
    Returns advancing/declining/unchanged counts from NSE_UNIVERSE.
    Approximation based on % change thresholds.
    """
    stocks = _get_all_stocks_data()
    advancing  = sum(1 for s in stocks if s["change_pct"] > 0.1)
    declining  = sum(1 for s in stocks if s["change_pct"] < -0.1)
    unchanged  = len(stocks) - advancing - declining
    total      = len(stocks)
    ratio      = round(advancing / declining, 2) if declining else advancing

    data = {
        "advancing":  advancing,
        "declining":  declining,
        "unchanged":  unchanged,
        "total":      total,
        "ad_ratio":   ratio,
        "ad_ratio_fmt": f"{ratio:.2f}",
        "bullish":    advancing > declining,
    }
    return Response(data)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/corporate-actions/
# ─────────────────────────────────────────────────────────────────────────────

PLACEHOLDER_CORP_ACTIONS = [
    {"company": "HDFC Bank",             "symbol": "HDFCBANK",   "action": "Dividend", "ex_date": "2025-07-18", "record_date": "2025-07-19", "details": "₹19.50 per share"},
    {"company": "TCS",                   "symbol": "TCS",        "action": "Dividend", "ex_date": "2025-07-11", "record_date": "2025-07-12", "details": "₹28.00 per share"},
    {"company": "Infosys",               "symbol": "INFY",       "action": "Dividend", "ex_date": "2025-08-01", "record_date": "2025-08-02", "details": "₹21.00 per share"},
    {"company": "ITC",                   "symbol": "ITC",        "action": "Dividend", "ex_date": "2025-07-22", "record_date": "2025-07-23", "details": "₹7.50 per share"},
    {"company": "Reliance Industries",   "symbol": "RELIANCE",   "action": "Bonus",    "ex_date": "2025-09-15", "record_date": "2025-09-16", "details": "1:1 Bonus Issue"},
    {"company": "Tata Motors",           "symbol": "TATAMOTORS", "action": "Split",    "ex_date": "2025-08-20", "record_date": "2025-08-21", "details": "2:1 Stock Split"},
    {"company": "Bajaj Finance",         "symbol": "BAJFINANCE", "action": "Dividend", "ex_date": "2025-07-29", "record_date": "2025-07-30", "details": "₹36.00 per share"},
    {"company": "Hindustan Unilever",    "symbol": "HINDUNILVR", "action": "Dividend", "ex_date": "2025-08-05", "record_date": "2025-08-06", "details": "₹24.00 per share"},
    {"company": "Sun Pharma",            "symbol": "SUNPHARMA",  "action": "Rights",   "ex_date": "2025-09-01", "record_date": "2025-09-02", "details": "1:5 @ ₹320"},
    {"company": "Nestle India",          "symbol": "NESTLEIND",  "action": "Dividend", "ex_date": "2025-08-12", "record_date": "2025-08-13", "details": "₹140.00 per share"},
]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_corporate_actions(request):
    """
    Returns upcoming corporate actions (dividends, bonuses, splits, rights).
    Currently uses structured placeholder data.
    Replace with NSE API integration when available.
    """
    return Response(PLACEHOLDER_CORP_ACTIONS)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/upcoming-ipos/
# ─────────────────────────────────────────────────────────────────────────────

PLACEHOLDER_IPOS = [
    {"name": "Ola Electric Mobility",    "open": "2025-08-02", "close": "2025-08-06", "price_band": "₹72 – ₹76",      "lot": 195, "listing": "2025-08-09", "status": "Upcoming",  "gmp": "+₹8"},
    {"name": "FirstCry (Brainbees)",     "open": "2025-08-05", "close": "2025-08-07", "price_band": "₹440 – ₹465",    "lot": 32,  "listing": "2025-08-12", "status": "Upcoming",  "gmp": "+₹24"},
    {"name": "Bajaj Housing Finance",    "open": "2025-08-09", "close": "2025-08-11", "price_band": "₹66 – ₹70",      "lot": 214, "listing": "2025-08-14", "status": "Upcoming",  "gmp": "+₹12"},
    {"name": "Waaree Energies",          "open": "2025-07-21", "close": "2025-07-23", "price_band": "₹1,427 – ₹1,503","lot": 9,   "listing": "2025-07-26", "status": "Listed",    "gmp": "+₹95"},
    {"name": "NTPC Green Energy",        "open": "2025-07-19", "close": "2025-07-23", "price_band": "₹102 – ₹108",    "lot": 138, "listing": "2025-07-26", "status": "Listed",    "gmp": "+₹6"},
    {"name": "Hyundai India",            "open": "2025-06-15", "close": "2025-06-17", "price_band": "₹1,865 – ₹1,960","lot": 7,   "listing": "2025-06-22", "status": "Listed",    "gmp": "+₹45"},
    {"name": "Swiggy",                   "open": "2025-05-06", "close": "2025-05-08", "price_band": "₹371 – ₹390",    "lot": 38,  "listing": "2025-05-13", "status": "Listed",    "gmp": "+₹22"},
]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_upcoming_ipos(request):
    """
    Returns upcoming and recently listed IPOs.
    Currently uses structured placeholder data.
    Replace with SEBI/NSE API integration when available.
    """
    return Response(PLACEHOLDER_IPOS)


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint: GET /api/market/search/?q=<query>
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def market_search(request):
    """
    Fast symbol/company search over the pre-loaded NSE stock list.
    No API calls — instant response from in-memory list.
    Returns top 8 matches.
    """
    q = request.query_params.get("q", "").strip().upper()
    if len(q) < 1:
        return Response([])

    matches = []
    for sym, name in SEARCH_LIST:
        if q in sym.upper() or q in name.upper():
            matches.append({"symbol": sym, "name": name})
        if len(matches) >= 8:
            break

    return Response(matches)
