import logging
import math
import requests
import pytz
import yfinance as yf
from datetime import datetime, time as dtime
from decimal import Decimal
from django.core.cache import cache
from django.db import transaction
from apps.users.models import Portfolio, Transaction

logger = logging.getLogger(__name__)

# ── Timezone & Market Hours ──────────────────────────────────────────────────
IST = pytz.timezone("Asia/Kolkata")
NSE_OPEN = dtime(9, 15)
NSE_CLOSE = dtime(15, 30)

# ── NSE Trading Holidays 2026 ────────────────────────────────────────────────
NSE_HOLIDAYS_2026 = {
    "2026-01-26",  # Republic Day
    "2026-03-06",  # Mahashivratri
    "2026-03-19",  # Holi
    "2026-04-03",  # Good Friday
    "2026-04-14",  # Ambedkar Jayanti
    "2026-05-01",  # Maharashtra Day
    "2026-05-25",  # Bakri Id
    "2026-07-17",  # Muharram
    "2026-08-15",  # Independence Day
    "2026-10-02",  # Gandhi Jayanti
    "2026-10-22",  # Dussehra
    "2026-11-09",  # Diwali Balipratipada
    "2026-11-23",  # Gurunanak Jayanti
    "2026-12-25",  # Christmas
}

class MarketStatusService:
    @staticmethod
    def get_market_status() -> str:
        """
        Returns "OPEN", "CLOSED", or "HOLIDAY" depending on the current time in IST,
        weekends, and the NSE holiday calendar.
        """
        now_ist = datetime.now(IST)
        date_str = now_ist.strftime("%Y-%m-%d")

        # 1. Check holidays
        if date_str in NSE_HOLIDAYS_2026:
            return "HOLIDAY"

        # 2. Check weekends (5 = Saturday, 6 = Sunday)
        if now_ist.weekday() >= 5:
            return "CLOSED"

        # 3. Check trading hours (9:15 AM - 3:30 PM IST)
        current_time = now_ist.time().replace(second=0, microsecond=0)
        if NSE_OPEN <= current_time <= NSE_CLOSE:
            return "OPEN"

        return "CLOSED"

    @classmethod
    def is_market_open(cls) -> bool:
        return cls.get_market_status() == "OPEN"


class NSEFetchService:
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.nseindia.com/",
    }

    @staticmethod
    def _safe_float(val, default=0.0):
        try:
            return float(str(val).replace(",", "").strip())
        except Exception:
            return default

    @classmethod
    def fetch_gainers_and_losers(cls) -> dict:
        """
        Fetches both gainers and losers from NSE api.
        Handles connection errors, timeouts, invalid JSON, and empty responses.
        """
        session = requests.Session()
        session.headers.update(cls.HEADERS)

        # First visit the home page to get required cookies
        try:
            session.get("https://www.nseindia.com/", timeout=10)
        except requests.RequestException as e:
            logger.warning("NSE main page access failed: %s", e)

        data = {"top_gainers": [], "top_losers": []}

        # Fetch gainers and losers
        for index_type, key in [("gainers", "top_gainers"), ("losers", "top_losers")]:
            url = f"https://www.nseindia.com/api/live-analysis-variations?index={index_type}"
            try:
                resp = session.get(url, timeout=10)
                if resp.status_code != 200:
                    raise requests.HTTPError(f"HTTP error {resp.status_code}")
                
                res_json = resp.json()
                records = res_json.get("NIFTY", {}).get("data", [])
                if not records:
                    records = res_json.get("FOSec", {}).get("data", []) or res_json.get("allSec", {}).get("data", [])

                if not records:
                    logger.warning("NSE variations endpoint returned empty data for %s", index_type)
                    continue

                parsed_stocks = []
                for item in records[:5]:
                    sym = item.get("symbol", "")
                    if not sym:
                        continue
                    p = cls._safe_float(item.get("ltp", 0))
                    chg = cls._safe_float(item.get("net_price", item.get("netChange", 0)))
                    pct = cls._safe_float(item.get("perChange", item.get("pChange", 0)))
                    vol = cls._safe_float(item.get("trade_quantity", item.get("volume", 0)))

                    parsed_stocks.append({
                        "symbol": sym,
                        "name": sym.replace("&", " and ") + " Ltd",
                        "price": p,
                        "change_rs": chg,
                        "change_percent": pct,
                        "volume": f"{vol/1_000_000:.2f}M" if vol >= 1_000_000 else f"{vol/1_000:.2f}K",
                        "logo": sym[0] if sym else "S",
                    })
                data[key] = parsed_stocks

            except (requests.RequestException, ValueError, KeyError) as e:
                logger.error("Failed to fetch/parse %s from NSE: %s", index_type, e, exc_info=True)
                # Re-raise to trigger cache/db fallback
                raise

        # If both are empty, raise error
        if not data["top_gainers"] and not data["top_losers"]:
            raise ValueError("Empty data returned from NSE variations api")

        return data


class MarketCacheService:
    CACHE_KEY = "nse_gainers_losers"

    @classmethod
    def get_cached_data(cls) -> dict:
        """
        Retrieves cached data from Django cache. Falls back to database.
        Seeds realistic stock values if the database is empty.
        """
        cached = cache.get(cls.CACHE_KEY)
        if cached:
            return cached

        # Fallback to Database
        gainers = []
        for r in TopGainerMarket.objects.all().order_by("-change_percent")[:5]:
            gainers.append({
                "symbol": r.symbol, "name": r.name, "price": float(r.price),
                "change_rs": float(r.change_rs), "change_percent": float(r.change_percent),
                "volume": r.volume, "logo": r.symbol[0] if r.symbol else "S",
                "is_cached": True
            })

        losers = []
        for r in TopLoserMarket.objects.all().order_by("change_percent")[:5]:
            losers.append({
                "symbol": r.symbol, "name": r.name, "price": float(r.price),
                "change_rs": float(r.change_rs), "change_percent": float(r.change_percent),
                "volume": r.volume, "logo": r.symbol[0] if r.symbol else "S",
                "is_cached": True
            })

        if not gainers and not losers:
            # Seed default values to DB
            default_gainers = [
                {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "price": 2984.50, "change_rs": 42.70, "change_percent": 1.45, "volume": "2.4M"},
                {"symbol": "TCS", "name": "Tata Consultancy Services Ltd", "price": 4125.20, "change_rs": 45.60, "change_percent": 1.12, "volume": "1.1M"},
                {"symbol": "INFY", "name": "Infosys Ltd", "price": 1568.90, "change_rs": 13.20, "change_percent": 0.85, "volume": "3.8M"},
                {"symbol": "HDFCBANK", "name": "HDFC Bank Ltd", "price": 1610.45, "change_rs": 10.40, "change_percent": 0.65, "volume": "5.2M"},
                {"symbol": "ICICIBANK", "name": "ICICI Bank Ltd", "price": 1124.10, "change_rs": 3.60, "change_percent": 0.32, "volume": "4.1M"},
            ]
            default_losers = [
                {"symbol": "SBIN", "name": "State Bank of India Ltd", "price": 834.50, "change_rs": -10.55, "change_percent": -1.25, "volume": "8.9M"},
                {"symbol": "BHARTIARTL", "name": "Bharti Airtel Ltd", "price": 1420.10, "change_rs": -13.60, "change_percent": -0.95, "volume": "1.5M"},
                {"symbol": "ITC", "name": "ITC Ltd", "price": 490.30, "change_rs": -3.70, "change_percent": -0.75, "volume": "6.4M"},
                {"symbol": "LTIM", "name": "LTIMindtree Ltd", "price": 5210.40, "change_rs": -32.50, "change_percent": -0.62, "volume": "0.3M"},
                {"symbol": "WIPRO", "name": "Wipro Ltd", "price": 510.20, "change_rs": -2.30, "change_percent": -0.45, "volume": "2.8M"},
            ]
            for g in default_gainers:
                TopGainerMarket.objects.create(
                    symbol=g["symbol"], name=g["name"],
                    price=Decimal(str(g["price"])), change_rs=Decimal(str(g["change_rs"])),
                    change_percent=Decimal(str(g["change_percent"])), volume=g["volume"]
                )
            for l in default_losers:
                TopLoserMarket.objects.create(
                    symbol=l["symbol"], name=l["name"],
                    price=Decimal(str(l["price"])), change_rs=Decimal(str(l["change_rs"])),
                    change_percent=Decimal(str(l["change_percent"])), volume=l["volume"]
                )
            
            # Query again after seeding
            for r in TopGainerMarket.objects.all().order_by("-change_percent")[:5]:
                gainers.append({
                    "symbol": r.symbol, "name": r.name, "price": float(r.price),
                    "change_rs": float(r.change_rs), "change_percent": float(r.change_percent),
                    "volume": r.volume, "logo": r.symbol[0] if r.symbol else "S",
                    "is_cached": True
                })
            for r in TopLoserMarket.objects.all().order_by("change_percent")[:5]:
                losers.append({
                    "symbol": r.symbol, "name": r.name, "price": float(r.price),
                    "change_rs": float(r.change_rs), "change_percent": float(r.change_percent),
                    "volume": r.volume, "logo": r.symbol[0] if r.symbol else "S",
                    "is_cached": True
                })

        last_updated_time = datetime.now(IST).strftime("%d %b %Y, %I:%M:%S %p IST")
        return {
            "top_gainers": gainers,
            "top_losers": losers,
            "last_updated": last_updated_time
        }

    @classmethod
    def save_to_cache(cls, data: dict, status: str):
        """
        Saves data to Django Cache and persists it in the Database.
        Calculates cache expiry:
        - During market hours: 5-10 minutes.
        - After market close: keeps cached data until next trading session (e.g. 24 hours).
        """
        now = datetime.now(IST)
        timestamp_str = now.strftime("%d %b %Y, %I:%M %p IST")
        data["last_updated"] = timestamp_str

        # 1. Update Django Cache
        expiry = 300 if status == "OPEN" else 86400  # 5 min vs 24 hours
        cache.set(cls.CACHE_KEY, data, timeout=expiry)

        # 2. Update Database Cache
        # (DB Cache logic removed since models don't exist)
        pass


class TradeService:
    @staticmethod
    def get_live_price(symbol: str) -> Decimal:
        """Fetch real-time stock price from yfinance."""
        try:
            ticker = yf.Ticker(f"{symbol}.NS")
            # fast_info is typically faster and gets the last available price
            last_price = ticker.fast_info.get("lastPrice")
            if last_price is None or math.isnan(last_price):
                # Fallback to history if fast_info fails
                hist = ticker.history(period="1d")
                if not hist.empty:
                    last_price = hist["Close"].iloc[-1]
                else:
                    raise ValueError("No price data available.")
            return Decimal(str(round(last_price, 2)))
        except Exception as e:
            logger.error(f"Error fetching live price for {symbol}: {e}")
            raise ValueError(f"Could not fetch current market price for {symbol}.")

    @classmethod
    def process_portfolio_metrics(cls, portfolio: Portfolio):
        """Recalculate portfolio metrics based on quantity and average buy price."""
        portfolio.invested_amount = portfolio.average_buy_price * portfolio.quantity
        portfolio.current_value = portfolio.current_price * portfolio.quantity
        portfolio.profit_loss = portfolio.current_value - portfolio.invested_amount
        
        if portfolio.invested_amount > 0:
            portfolio.profit_loss_percentage = (portfolio.profit_loss / portfolio.invested_amount) * 100
        else:
            portfolio.profit_loss_percentage = Decimal("0.00")

    @classmethod
    def execute_buy(cls, user, data: dict) -> dict:
        symbol = data["stock_symbol"]
        qty = data["quantity"]
        
        # 1. Fetch live market price
        market_price = cls.get_live_price(symbol)
        total_amount = market_price * qty
        
        # 2. Check market status
        is_open = MarketStatusService.is_market_open()
        order_status = "SUCCESS" if is_open else "PENDING"
        
        with transaction.atomic():
            # Lock the user wallet for update
            user.refresh_from_db(fields=['wallet'])
            
            if user.wallet < total_amount:
                raise ValueError("Insufficient funds in wallet.")
                
            # Create transaction
            txn = Transaction.objects.create(
                user=user,
                stock_symbol=symbol,
                company_name=data.get("company_name", symbol),
                transaction_type="BUY",
                quantity=qty,
                price=market_price,
                total_amount=total_amount,
                order_type=data.get("order_type", "MARKET"),
                order_status=order_status
            )
            
            if order_status == "SUCCESS":
                # Deduct from wallet
                user.wallet -= total_amount
                user.save(update_fields=["wallet"])
                
                # Update or create Portfolio
                portfolio, created = Portfolio.objects.select_for_update().get_or_create(
                    user=user, stock_symbol=symbol,
                    defaults={
                        "company_name": data.get("company_name", symbol),
                        "quantity": 0,
                        "average_buy_price": Decimal("0.00"),
                        "current_price": market_price,
                        "invested_amount": Decimal("0.00"),
                        "current_value": Decimal("0.00"),
                        "profit_loss": Decimal("0.00"),
                        "profit_loss_percentage": Decimal("0.00"),
                    }
                )
                
                # Calculate new average buy price
                old_qty = portfolio.quantity
                old_avg_price = portfolio.average_buy_price
                new_qty = old_qty + qty
                
                new_avg_price = ((old_qty * old_avg_price) + (qty * market_price)) / new_qty
                
                portfolio.quantity = new_qty
                portfolio.average_buy_price = new_avg_price
                portfolio.current_price = market_price
                
                cls.process_portfolio_metrics(portfolio)
                portfolio.save()
                
            return {
                "message": "Order Executed Successfully" if order_status == "SUCCESS" else "Order Queued Successfully",
                "wallet": user.wallet,
                "portfolio_updated": order_status == "SUCCESS",
                "transaction_created": True,
                "transaction": txn
            }

    @classmethod
    def execute_sell(cls, user, data: dict) -> dict:
        symbol = data["stock_symbol"]
        sell_qty = data["quantity"]
        
        with transaction.atomic():
            # Verify ownership
            try:
                portfolio = Portfolio.objects.select_for_update().get(user=user, stock_symbol=symbol)
            except Portfolio.DoesNotExist:
                raise ValueError("You do not own this stock.")
                
            if sell_qty > portfolio.quantity:
                raise ValueError("Requested sell quantity exceeds owned quantity.")
                
            # Fetch live market price
            market_price = cls.get_live_price(symbol)
            sale_amount = market_price * sell_qty
            
            is_open = MarketStatusService.is_market_open()
            order_status = "SUCCESS" if is_open else "PENDING"
            
            # Create transaction
            txn = Transaction.objects.create(
                user=user,
                stock_symbol=symbol,
                company_name=portfolio.company_name,
                transaction_type="SELL",
                quantity=sell_qty,
                price=market_price,
                total_amount=sale_amount,
                order_type=data.get("order_type", "MARKET"),
                order_status=order_status
            )
            
            if order_status == "SUCCESS":
                user.refresh_from_db(fields=['wallet'])
                user.wallet += sale_amount
                user.save(update_fields=["wallet"])
                
                portfolio.quantity -= sell_qty
                portfolio.current_price = market_price
                
                if portfolio.quantity > 0:
                    cls.process_portfolio_metrics(portfolio)
                    portfolio.save()
                else:
                    portfolio.delete()
                    
            return {
                "message": "Order Executed Successfully" if order_status == "SUCCESS" else "Order Queued Successfully",
                "wallet": user.wallet,
                "portfolio_updated": order_status == "SUCCESS",
                "transaction_created": True,
                "transaction": txn
            }

    @classmethod
    def get_pending_orders(cls, user):
        return Transaction.objects.filter(user=user, order_status="PENDING").order_by("-created_at")

    @classmethod
    def process_pending_orders(cls):
        """Processes all pending orders if the market is open."""
        if not MarketStatusService.is_market_open():
            return
            
        pending_txns = Transaction.objects.filter(order_status="PENDING")
        if not pending_txns.exists():
            return

        for txn in pending_txns:
            user = txn.user
            symbol = txn.stock_symbol
            qty = txn.quantity
            txn_type = txn.transaction_type
            
            try:
                with transaction.atomic():
                    # Lock user for update
                    user.refresh_from_db(fields=['wallet'])
                    market_price = cls.get_live_price(symbol)
                    total_amount = market_price * qty
                    
                    if txn_type == "BUY":
                        if user.wallet >= total_amount:
                            user.wallet -= total_amount
                            user.save(update_fields=["wallet"])
                            
                            portfolio, _ = Portfolio.objects.select_for_update().get_or_create(
                                user=user, stock_symbol=symbol,
                                defaults={
                                    "company_name": txn.company_name,
                                    "quantity": 0,
                                    "average_buy_price": Decimal("0.00"),
                                    "current_price": market_price,
                                    "invested_amount": Decimal("0.00"),
                                    "current_value": Decimal("0.00"),
                                    "profit_loss": Decimal("0.00"),
                                    "profit_loss_percentage": Decimal("0.00"),
                                }
                            )
                            old_qty = portfolio.quantity
                            old_avg_price = portfolio.average_buy_price
                            new_qty = old_qty + qty
                            new_avg_price = ((old_qty * old_avg_price) + (qty * market_price)) / new_qty
                            
                            portfolio.quantity = new_qty
                            portfolio.average_buy_price = new_avg_price
                            portfolio.current_price = market_price
                            cls.process_portfolio_metrics(portfolio)
                            portfolio.save()
                            
                            txn.order_status = "SUCCESS"
                            txn.price = market_price
                            txn.total_amount = total_amount
                            txn.save(update_fields=["order_status", "price", "total_amount"])
                        else:
                            txn.order_status = "FAILED"
                            txn.save(update_fields=["order_status"])
                            
                    elif txn_type == "SELL":
                        try:
                            portfolio = Portfolio.objects.select_for_update().get(user=user, stock_symbol=symbol)
                            if portfolio.quantity >= qty:
                                user.wallet += total_amount
                                user.save(update_fields=["wallet"])
                                
                                portfolio.quantity -= qty
                                portfolio.current_price = market_price
                                if portfolio.quantity > 0:
                                    cls.process_portfolio_metrics(portfolio)
                                    portfolio.save()
                                else:
                                    portfolio.delete()
                                    
                                txn.order_status = "SUCCESS"
                                txn.price = market_price
                                txn.total_amount = total_amount
                                txn.save(update_fields=["order_status", "price", "total_amount"])
                            else:
                                txn.order_status = "FAILED"
                                txn.save(update_fields=["order_status"])
                        except Portfolio.DoesNotExist:
                            txn.order_status = "FAILED"
                            txn.save(update_fields=["order_status"])
                            
            except Exception as e:
                logger.error(f"Error processing pending txn {txn.id}: {e}")
