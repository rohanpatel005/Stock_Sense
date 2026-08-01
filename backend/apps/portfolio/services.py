import logging
import yfinance as yf
from decimal import Decimal
from apps.users.models import Portfolio
from django.db.models import Sum

logger = logging.getLogger(__name__)

class PortfolioService:
    @staticmethod
    def _fetch_live_prices(symbols):
        """Fetch live prices for a list of symbols using yfinance."""
        if not symbols:
            return {}
            
        prices = {}
        try:
            # We append .NS to symbols assuming NSE since it's an Indian app context, 
            # though symbols might already have it depending on the DB state.
            query_symbols = [sym if sym.endswith('.NS') or sym.endswith('.BO') else f"{sym}.NS" for sym in symbols]
            
            # Use space-separated string for yfinance
            tickers = yf.Tickers(" ".join(query_symbols))
            
            for original_sym, query_sym in zip(symbols, query_symbols):
                try:
                    ticker = tickers.tickers.get(query_sym.upper())
                    if ticker and 'regularMarketPrice' in ticker.info:
                        price = ticker.info.get('regularMarketPrice')
                        prev_close = ticker.info.get('regularMarketPreviousClose')
                        
                        prices[original_sym] = {
                            'price': Decimal(str(price)) if price else None,
                            'prev_close': Decimal(str(prev_close)) if prev_close else None
                        }
                    else:
                        # Fallback for fastinfo if info dict is empty
                        fast = ticker.fast_info
                        if fast and hasattr(fast, 'last_price'):
                            prices[original_sym] = {
                                'price': Decimal(str(fast.last_price)),
                                'prev_close': Decimal(str(fast.previous_close)) if hasattr(fast, 'previous_close') else None
                            }
                except Exception as e:
                    logger.warning(f"Failed to fetch live price for {original_sym}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Error bulk fetching from yfinance: {str(e)}")
            
        return prices

    @staticmethod
    def get_live_portfolio(user):
        """
        Retrieves user's portfolio and dynamically calculates metrics with live market data.
        Returns the updated queryset (does NOT save to DB to avoid heavy writes on every fetch).
        """
        portfolio_qs = Portfolio.objects.filter(user=user, quantity__gt=0).order_by('-updated_at')
        holdings = list(portfolio_qs)
        
        if not holdings:
            return holdings
            
        symbols = [h.stock_symbol for h in holdings]
        live_data = PortfolioService._fetch_live_prices(symbols)
        
        for holding in holdings:
            data = live_data.get(holding.stock_symbol)
            if data and data.get('price'):
                current_price = data['price']
                
                # Calculate metrics
                holding.current_price = current_price
                holding.current_value = current_price * holding.quantity
                holding.profit_loss = holding.current_value - holding.invested_amount
                
                if holding.invested_amount > 0:
                    holding.profit_loss_percentage = (holding.profit_loss / holding.invested_amount) * Decimal("100.0")
                else:
                    holding.profit_loss_percentage = Decimal("0.0")
                    
                # Calculate day change percentage
                if data.get('prev_close') and data['prev_close'] > 0:
                    holding.day_change_percentage = ((current_price - data['prev_close']) / data['prev_close']) * Decimal("100.0")
                else:
                    holding.day_change_percentage = Decimal("0.0")
            else:
                # Fallback to DB values if live fetch fails
                holding.day_change_percentage = Decimal("0.0")
                
        return holdings

    @staticmethod
    def get_portfolio_summary(user, live_holdings=None):
        """
        Aggregates the portfolio to calculate high-level metrics.
        Can optionally take live_holdings to avoid re-fetching data.
        """
        if live_holdings is None:
            live_holdings = PortfolioService.get_live_portfolio(user)
            
        total_value = sum(h.current_value for h in live_holdings)
        invested_amount = sum(h.invested_amount for h in live_holdings)
        overall_pl = total_value - invested_amount
        
        total_return = Decimal("0.0")
        if invested_amount > 0:
            total_return = (overall_pl / invested_amount) * Decimal("100.0")
            
        return {
            "current_portfolio_value": round(total_value, 2),
            "available_cash": round(user.wallet, 2),
            "invested_amount": round(invested_amount, 2),
            "overall_profit_loss": round(overall_pl, 2),
            "total_return_percentage": round(total_return, 2)
        }
