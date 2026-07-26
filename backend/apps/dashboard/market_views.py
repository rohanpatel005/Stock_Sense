import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

NSE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.nseindia.com/"
}

def fetch_nse_live_variations(index_type):
    """
    Fetches live gainers/loosers directly from NSE API.
    Maintains session to bypass blocking.
    """
    session = requests.Session()
    # Hit the home page first to establish cookies / session details
    try:
        session.get("https://www.nseindia.com/", headers=NSE_HEADERS, timeout=10)
    except Exception:
        pass

    url = f"https://www.nseindia.com/api/live-analysis-variations?index={index_type}"
    try:
        response = session.get(url, headers=NSE_HEADERS, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # The data structure has list in 'data' key
            records = data.get("data", [])
            stocks = []
            for item in records[:5]:
                symbol = item.get("symbol")
                price = float(str(item.get("ltp", 0)).replace(",", ""))
                change = float(str(item.get("netChange", 0)).replace(",", ""))
                change_percent = float(str(item.get("pChange", 0)).replace(",", ""))
                volume = float(str(item.get("volume", 0)).replace(",", ""))
                
                stocks.append({
                    "symbol": symbol,
                    "name": symbol.replace("&", " and ") + " Ltd",
                    "price": round(price, 2),
                    "change_rs": round(change, 2),
                    "change_percent": round(change_percent, 2),
                    "volume": f"{round(volume / 1000000, 2)}M" if volume >= 1000000 else f"{round(volume / 1000, 2)}K",
                    "chart": [price - change, price], # simple sparkline fallback
                    "logo": symbol[0] if symbol else "S"
                })
            return stocks
    except Exception:
        pass
    return None

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_gainers(request):
    data = fetch_nse_live_variations("gainers")
    if data is not None:
        return Response(data, status=status.HTTP_200_OK)
    return Response({"error": "Unable to load Top Gainers."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top_losers(request):
    # The URL parameter provided by user is 'loosers'
    data = fetch_nse_live_variations("loosers")
    if data is not None:
        return Response(data, status=status.HTTP_200_OK)
    return Response({"error": "Unable to load Top Losers."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
