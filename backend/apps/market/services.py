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


class TradeService:
    @staticmethod
    def get_live_price(symbol: str) -> Decimal:
        """Fetch real-time stock price from yfinance."""
        try:
            symbol_upper = symbol.strip().upper()
            yf_symbol = symbol_upper if "." in symbol_upper else f"{symbol_upper}.NS"
            ticker = yf.Ticker(yf_symbol)
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
