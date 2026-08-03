from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from apps.users.models import Transaction, Portfolio
import yfinance as yf

import math

# Helper function to get real-time price from Yahoo Finance
def get_live_stock_data(symbol, default_val=100.0):
    def safe_float(val, default=0.0):
        """Convert to float, replacing NaN/Inf with default."""
        try:
            v = float(val)
            return default if (math.isnan(v) or math.isinf(v)) else v
        except Exception:
            return default

    try:
        # Indian stocks on Yahoo Finance need .NS suffix, except indices starting with ^
        is_index = symbol.startswith("^")
        ticker = yf.Ticker(symbol if (is_index or symbol.endswith(".NS")) else f"{symbol}.NS")
        # Get fast info or historical info (last 1 day)
        history = ticker.history(period="2d")
        if not history.empty and len(history) >= 2:
            prev_close    = safe_float(history['Close'].iloc[-2], default_val)
            current_price = safe_float(history['Close'].iloc[-1], default_val)
            change        = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0.0

            # Filter NaN values from chart — float('nan') is not JSON-serialisable
            chart = [safe_float(v) for v in history['Close'].tolist() if not (isinstance(v, float) and math.isnan(v))]

            return {
                "price": round(current_price, 2),
                "change": f"{'+' if change >= 0 else ''}{round(change, 2)}",
                "change_percent": f"{'+' if change >= 0 else ''}{round(change_percent, 2)}%",
                "trend": "up" if change >= 0 else "down",
                "chart": chart
            }
    except Exception:
        pass

    # Fallback to mock values if Yahoo Finance query fails or is throttled
    return {
        "price": default_val,
        "change": "+2.50",
        "change_percent": "+1.25%",
        "trend": "up",
        "chart": [default_val - 10, default_val - 5, default_val, default_val + 2, default_val]
    }


from apps.market.views import market_overview, market_sectors

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Returns high-level statistics, market overview, trending stocks,
    sector performance, watchlist, paper trades, holdings, FII/DII activity,
    options data, and AI insights for the Indian market.
    """
    user = request.user
    
    # Fetch live values for top indices (Nifty 50, Sensex, Bank Nifty) from NSE API instead of yfinance
    overview_res = market_overview(request._request).data
    sectors_res = market_sectors(request._request).data
    
    def get_index(name, default_price):
        item = next((s for s in overview_res if s["name"] == name), None)
        if not item:
            return {"price": default_price, "change": "+0.00", "change_percent": "+0.00%", "trend": "up", "chart": []}
        change = item["change"]
        change_pct = item["change_percent"]
        trend = "up" if change >= 0 else "down"
        return {
            "price": item["value"],
            "change": f"{'+' if change >= 0 else ''}{round(change, 2)}",
            "change_percent": f"{'+' if change_pct >= 0 else ''}{round(change_pct, 2)}%",
            "trend": trend,
            "chart": item.get("sparkline", [])
        }

    nifty = get_index("Nifty 50", 24834.85)
    sensex = get_index("Sensex", 81332.72)
    bank_nifty = get_index("Bank Nifty", 51295.40)
    
    # Fetch user specific database holdings
    total_invested = Portfolio.objects.filter(user=user).aggregate(Sum('invested_amount'))['invested_amount__sum'] or 0.00
    current_portfolio_value = Portfolio.objects.filter(user=user).aggregate(Sum('current_value'))['current_value__sum'] or 0.00
    today_pl = Portfolio.objects.filter(user=user).aggregate(Sum('profit_loss'))['profit_loss__sum'] or 0.00
    
    # Fetch dynamic values for main trending stocks
    reliance = get_live_stock_data("RELIANCE", 2984.50)
    tcs = get_live_stock_data("TCS", 4125.20)
    infy = get_live_stock_data("INFY", 1568.90)
    sbin = get_live_stock_data("SBIN", 834.50)
    hdfc = get_live_stock_data("HDFCBANK", 1610.45)
    icici = get_live_stock_data("ICICIBANK", 1124.10)
    
    # Fetch recent transactions
    transactions = Transaction.objects.filter(user=user).order_by('-created_at')[:10]
    recent_trades_data = []
    for tx in transactions:
        recent_trades_data.append({
            "symbol": tx.stock_symbol,
            "type": tx.transaction_type,
            "quantity": tx.quantity,
            "price": f"{tx.price:,}",
            "pl": f"{'+' if tx.total_amount >= 0 else ''}{tx.total_amount:,}",
            "timestamp": tx.created_at.strftime("%I:%M %p") if tx.created_at else ""
        })

    
    return Response({
        "summary": {
            "nifty_50": {
                "name": "NIFTY 50",
                "value": f"{nifty['price']:,.2f}",
                "change": nifty['change'],
                "change_percent": nifty['change_percent'],
                "trend": nifty['trend']
            },
            "sensex": {
                "name": "SENSEX",
                "value": f"{sensex['price']:,.2f}",
                "change": sensex['change'],
                "change_percent": sensex['change_percent'],
                "trend": sensex['trend']
            },
            "bank_nifty": {
                "name": "BANK NIFTY",
                "value": f"{bank_nifty['price']:,.2f}",
                "change": bank_nifty['change'],
                "change_percent": bank_nifty['change_percent'],
                "trend": bank_nifty['trend']
            },
            "portfolio": {
                "invested": float(total_invested),
                "current_value": float(current_portfolio_value),
                "today_pl": float(today_pl),
                "today_pl_percent": round((float(today_pl) / float(total_invested) * 100) if total_invested else 0.00, 2)
            },
            "wallet": {
                "initial": 50000.00,
                "current": float(user.wallet),
                "available": float(user.wallet),
                "total_invested": float(total_invested)
            },
            "ai_mood": {
                "mood": "Bullish" if nifty['trend'] == 'up' else "Bearish",
                "confidence": 88
            }
        },
        "market_overview": [
            {"symbol": "NIFTY 50", "value": f"{nifty['price']:,.2f}", "change": nifty['change_percent'], "trend": nifty['trend'], "chart": nifty['chart']},
            {"symbol": "BANK NIFTY", "value": f"{bank_nifty['price']:,.2f}", "change": bank_nifty['change_percent'], "trend": bank_nifty['trend'], "chart": bank_nifty['chart']},
            {"symbol": "SENSEX", "value": f"{sensex['price']:,.2f}", "change": sensex['change_percent'], "trend": sensex['trend'], "chart": sensex['chart']},
            {"symbol": "NIFTY IT", "value": "39,124.50", "change": "+1.45%", "trend": "up", "chart": [38400, 38600, 38800, 39000, 39124]},
            {"symbol": "NIFTY AUTO", "value": "25,482.10", "change": "+0.92%", "trend": "up", "chart": [25100, 25250, 25300, 25400, 25482]},
            {"symbol": "NIFTY FMCG", "value": "57,324.40", "change": "-0.15%", "trend": "down", "chart": [57500, 57450, 57400, 57350, 57324]}
        ],
        "trending_stocks": [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "price": f"{reliance['price']:,}", "change": reliance['change_percent'], "trend": reliance['trend'], "logo": "R", "chart": reliance['chart']},
            {"symbol": "TCS", "name": "Tata Consultancy Services", "price": f"{tcs['price']:,}", "change": tcs['change_percent'], "trend": tcs['trend'], "logo": "T", "chart": tcs['chart']},
            {"symbol": "INFY", "name": "Infosys Limited", "price": f"{infy['price']:,}", "change": infy['change_percent'], "trend": infy['trend'], "logo": "I", "chart": infy['chart']},
            {"symbol": "HDFCBANK", "name": "HDFC Bank Limited", "price": f"{hdfc['price']:,}", "change": hdfc['change_percent'], "trend": hdfc['trend'], "logo": "H", "chart": hdfc['chart']},
            {"symbol": "ICICIBANK", "name": "ICICI Bank Limited", "price": f"{icici['price']:,}", "change": icici['change_percent'], "trend": icici['trend'], "logo": "I", "chart": icici['chart']},
            {"symbol": "SBIN", "name": "State Bank of India", "price": f"{sbin['price']:,}", "change": sbin['change_percent'], "trend": sbin['trend'], "logo": "S", "chart": sbin['chart']}
        ],
        "top_gainers": [
            {"symbol": "TATAMOTORS", "name": "Tata Motors", "price": "1,024.50", "change": "+5.45%", "volume": "12.4M"},
            {"symbol": "LT", "name": "Larsen & Toubro", "price": "3,485.20", "change": "+3.82%", "volume": "4.1M"},
            {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "price": "1,425.10", "change": "+3.12%", "volume": "8.7M"}
        ],
        "top_losers": [
            {"symbol": "ADANIENT", "name": "Adani Enterprises", "price": "3,112.40", "change": "-4.21%", "volume": "3.2M"},
            {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "price": f"{hdfc['price']:,}", "change": "-2.10%", "volume": "15.1M"},
            {"symbol": "INFY", "name": "Infosys Ltd", "price": f"{infy['price']:,}", "change": "-1.85%", "volume": "6.8M"}
        ],
        "sector_performance": [
            {
                "sector": s["name"].upper(), 
                "change": f"{'+' if s['change_percent'] >= 0 else ''}{s['change_percent']}%"
            } for s in sectors_res
        ][:7],
        "watchlist": [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "price": f"{reliance['price']:,}", "change": reliance['change_percent'], "trend": reliance['trend']},
            {"symbol": "TCS", "name": "Tata Consultancy Services", "price": f"{tcs['price']:,}", "change": tcs['change_percent'], "trend": tcs['trend']},
            {"symbol": "INFY", "name": "Infosys Limited", "price": f"{infy['price']:,}", "change": infy['change_percent'], "trend": infy['trend']},
            {"symbol": "SBIN", "name": "State Bank of India", "price": f"{sbin['price']:,}", "change": sbin['change_percent'], "trend": sbin['trend']}
        ],
        "fii_dii": {
            "fii_buy": "12,430.50 Cr",
            "dii_buy": "14,120.20 Cr",
            "net_flow": "+1,689.70 Cr",
            "trend": "up"
        },
        "options_data": {
            "pcr": "1.12",
            "max_pain": "24,800",
            "open_interest": "24.5M",
            "iv": "13.4%"
        },
        "news": [
            {"source": "Moneycontrol", "time": "5m ago", "title": "Reliance AGM: Key announcements on retail, 5G and green energy expansion expected soon"},
            {"source": "Economic Times", "time": "18m ago", "title": "FII buying returns to Indian markets; Nifty IT hits fresh 52-week highs"},
            {"source": "Business Standard", "time": "1h ago", "title": "Tata Motors commercial vehicle sales grow by 8% YoY; stock hits record high"}
        ],
        "recent_trades": recent_trades_data,
        "ai_insights": [
            f"Reliance Industries showing strong momentum at ₹{reliance['price']:,}.",
            f"Bank Nifty support remains active around {bank_nifty['price']:,}.",
            f"TCS price of ₹{tcs['price']:,} indicates moderate oversold levels.",
            "High institutional buying in HDFC Bank today."
        ],
        "user": {
            "full_name": user.full_name,
            "email": user.email,
            "wallet": float(user.wallet)
        }
    }, status=status.HTTP_200_OK)
