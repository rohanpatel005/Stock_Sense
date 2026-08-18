from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from users.models import Transaction, Portfolio
from market.views import is_nse_open_status, _cache_store, IST, dtime


from market.views import market_overview, market_sectors, fetch_nse_api, fetch_nse_variations, get_cached_data, set_cached_data, sf


# Helper function to get real-time price from NSE API
def get_nse_stock_data(symbol, default_val=100.0):
    """Fetch live stock price from NSE quote-equity API with caching."""
    cache_key = f"nse_stock_{symbol}"
    cached = get_cached_data(cache_key)
    if cached:
        return cached

    try:
        res_json = fetch_nse_api(f"quote-equity?symbol={symbol}")
        price_info = res_json.get("priceInfo", {})
        info = res_json.get("info", {})

        price = sf(price_info.get("lastPrice", 0))
        prev_close = sf(price_info.get("previousClose", 0))

        if price and prev_close:
            change = price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0.0
            result = {
                "price": round(price, 2),
                "change": f"{'+' if change >= 0 else ''}{round(change, 2)}",
                "change_percent": f"{'+' if change_percent >= 0 else ''}{round(change_percent, 2)}%",
                "trend": "up" if change >= 0 else "down",
            }
            return set_cached_data(cache_key, result)
    except Exception:
        pass

    # Return None if NSE API fails
    return None




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
        if item:
            change = item.get("change", 0)
            change_pct = item.get("change_percent", 0)
            return {
                "price": f"{item['value']:,.2f}",
                "change": f"{'+' if change >= 0 else ''}{round(change, 2)}",
                "change_percent": f"{'+' if change_pct >= 0 else ''}{round(change_pct, 2)}%",
                "trend": item.get("trend", "up"),
                "chart": item.get("sparkline", [])
            }
        return {
            "price": f"{default_price:,.2f}",
            "change": "0.00",
            "change_percent": "0.00%",
            "trend": "up",
            "chart": []
        }

    nifty = get_index("Nifty 50", 22000.0)
    sensex = get_index("Sensex", 73000.0)
    bank_nifty = get_index("Bank Nifty", 46000.0)
    
    # Fetch user specific database holdings
    total_invested = Portfolio.objects.filter(user=user).aggregate(Sum('invested_amount'))['invested_amount__sum'] or 0.00
    current_portfolio_value = Portfolio.objects.filter(user=user).aggregate(Sum('current_value'))['current_value__sum'] or 0.00
    today_pl = Portfolio.objects.filter(user=user).aggregate(Sum('profit_loss'))['profit_loss__sum'] or 0.00
    
    # Fetch live trending stocks from NSE (gainers API — same source as live_market_data)
    nse_gainers = fetch_nse_variations("gainers")
    nse_losers = fetch_nse_variations("losers")
    
    # (Watchlist is handled via a separate endpoint/app for actual users)
    
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

    
    # Get FII/DII Data
    try:
        
        from datetime import datetime
        now_ist = datetime.now(IST)
        period_key = f"{now_ist.date()}_after_17" if now_ist.time() >= dtime(17, 0) else f"{now_ist.date()}_before_17"
        cache_key = f"fii_dii_daily_{period_key}"
        
        cached_fii = _cache_store.get(cache_key)
        if cached_fii:
            fii_dii_data = cached_fii["data"]
        else:
            fii_dii_res = fetch_nse_api("fiidiiTradeReact")
            fii_buy = "N/A"
            dii_buy = "N/A"
            net_flow_val = 0.0
            fii_sell = "N/A"
            dii_sell = "N/A"
            for item in fii_dii_res:
                cat = item.get("category", "")
                if cat == "DII":
                    dii_buy = f"₹{float(item.get('buyValue', 0)):,.2f} Cr"
                    dii_sell = f"₹{float(item.get('sellValue', 0)):,.2f} Cr"
                    net_flow_val += float(item.get('netValue', 0))
                elif cat == "FII/FPI":
                    fii_buy = f"₹{float(item.get('buyValue', 0)):,.2f} Cr"
                    fii_sell = f"₹{float(item.get('sellValue', 0)):,.2f} Cr"
                    net_flow_val += float(item.get('netValue', 0))
            net_flow = f"{'+' if net_flow_val >= 0 else '-'}₹{abs(net_flow_val):,.2f} Cr"
            fii_dii_data = {
                "fii_buy": fii_buy,
                "fii_sell": fii_sell,
                "dii_buy": dii_buy,
                "dii_sell": dii_sell,
                "net_flow": net_flow
            }
            _cache_store[cache_key] = {"data": fii_dii_data, "time": __import__('time').time()}
    except Exception as e:
        import traceback
        traceback.print_exc()
        fii_dii_data = {
            "fii_buy": "N/A",
            "fii_sell": "N/A",
            "dii_buy": "N/A",
            "dii_sell": "N/A",
            "net_flow": "N/A",
            "trend": "up"
        }

    # Build trending stocks from live NSE gainers data
    trending_stocks_data = [
        {
            "symbol": s["symbol"],
            "name": s["name"],
            "price": f"{s['price']:,.2f}",
            "change": f"{'+' if s['change_percent'] >= 0 else ''}{s['change_percent']}%",
            "trend": "up" if s["change"] >= 0 else "down",
            "logo": s["symbol"][0],
            "chart": s.get("sparkline", [])
        }
        for s in nse_gainers[:6]
    ]

    # Build top gainers from live NSE data
    top_gainers_data = [
        {
            "symbol": s["symbol"],
            "name": s["name"],
            "price": f"{s['price']:,.2f}",
            "change": f"{'+' if s['change_percent'] >= 0 else ''}{s['change_percent']}%",
            "volume": f"{s['volume']:,.0f}" if isinstance(s.get('volume'), (int, float)) else str(s.get('volume', 'N/A'))
        }
        for s in nse_gainers[:3]
    ]

    # Build top losers from live NSE data
    top_losers_data = [
        {
            "symbol": s["symbol"],
            "name": s["name"],
            "price": f"{s['price']:,.2f}",
            "change": f"{'+' if s['change_percent'] >= 0 else ''}{s['change_percent']}%",
            "volume": f"{s['volume']:,.0f}" if isinstance(s.get('volume'), (int, float)) else str(s.get('volume', 'N/A'))
        }
        for s in nse_losers[:3]
    ]

    return Response({
        "summary": {
            "nifty_50": {
                "name": "NIFTY 50",
                "value": nifty['price'] if nifty else "N/A",
                "change": nifty['change'] if nifty else "N/A",
                "change_percent": nifty['change_percent'] if nifty else "N/A",
                "trend": nifty['trend'] if nifty else "up"
            },
            "sensex": {
                "name": "SENSEX",
                "value": sensex['price'] if sensex else "N/A",
                "change": sensex['change'] if sensex else "N/A",
                "change_percent": sensex['change_percent'] if sensex else "N/A",
                "trend": sensex['trend'] if sensex else "up"
            },
            "bank_nifty": {
                "name": "BANK NIFTY",
                "value": bank_nifty['price'] if bank_nifty else "N/A",
                "change": bank_nifty['change'] if bank_nifty else "N/A",
                "change_percent": bank_nifty['change_percent'] if bank_nifty else "N/A",
                "trend": bank_nifty['trend'] if bank_nifty else "up"
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
                "mood": "Bullish" if (nifty and nifty['trend'] == 'up') else "Bearish",
                "confidence": 88
            }
        },
        "market_overview": [
            {"symbol": "NIFTY 50", "value": nifty['price'], "change": nifty['change_percent'], "trend": nifty['trend'], "chart": nifty['chart']} if nifty else None,
            {"symbol": "BANK NIFTY", "value": bank_nifty['price'], "change": bank_nifty['change_percent'], "trend": bank_nifty['trend'], "chart": bank_nifty['chart']} if bank_nifty else None,
            {"symbol": "SENSEX", "value": sensex['price'], "change": sensex['change_percent'], "trend": sensex['trend'], "chart": sensex['chart']} if sensex else None
        ],
        "trending_stocks": trending_stocks_data,
        "top_gainers": top_gainers_data,
        "top_losers": top_losers_data,
        "sector_performance": [
            {
                "sector": s["name"].upper(), 
                "change": f"{'+' if s['change_percent'] >= 0 else ''}{s['change_percent']}%"
            } for s in sectors_res
        ][:7],
        "watchlist": [],
        "fii_dii": fii_dii_data,
        "options_data": {},
        "news": [],
        "recent_trades": recent_trades_data,
        "ai_insights": [],
        "user": {
            "full_name": user.full_name,
            "email": user.email,
            "wallet": float(user.wallet)
        }
    }, status=status.HTTP_200_OK)

