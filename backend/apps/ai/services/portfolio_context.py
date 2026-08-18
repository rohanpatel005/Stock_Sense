import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from decimal import Decimal
from portfolio.services import PortfolioService
from users.models import Transaction, Portfolio

class PortfolioContextService:
    @staticmethod
    def _fetch_sector(symbol: str) -> str:
        """Fetches the sector for a given symbol using yfinance."""
        try:
            yf_symbol = f"{symbol.upper()}.NS" if "." not in symbol else symbol.upper()
            ticker = yf.Ticker(yf_symbol)
            info = ticker.info or {}
            return info.get("sector", "Unknown")
        except Exception:
            return "Unknown"

    @staticmethod
    def build_portfolio_context(user) -> dict:
        """
        Gathers user portfolio data, holdings, and transactions to build
        a summarized context dictionary for the AI.
        """
        # 1. Fetch live portfolio and summary
        # PortfolioService.get_live_portfolio updates prices
        try:
            live_holdings = PortfolioService.get_live_portfolio(user)
        except Exception:
            # Fallback to database values if live fetch fails
            live_holdings = list(Portfolio.objects.filter(user=user))
            
        summary = PortfolioService.get_portfolio_summary(user)
        
        # 2. Holdings Summary
        # Sort by invested amount (or current value) and limit to top 15 to save tokens
        live_holdings_sorted = sorted(live_holdings, key=lambda h: h.current_value, reverse=True)[:15]
        
        holdings_summary = []
        symbols = [h.stock_symbol for h in live_holdings_sorted]
        
        # Fetch sectors concurrently
        sector_map = {}
        if symbols:
            with ThreadPoolExecutor(max_workers=5) as executor:
                future_to_symbol = {executor.submit(PortfolioContextService._fetch_sector, sym): sym for sym in symbols}
                for future in as_completed(future_to_symbol):
                    sym = future_to_symbol[future]
                    try:
                        sector_map[sym] = future.result()
                    except Exception:
                        sector_map[sym] = "Unknown"

        sector_allocation = {}
        total_portfolio_value = summary.get("current_portfolio_value", Decimal("0.0"))

        for h in live_holdings_sorted:
            sector = sector_map.get(h.stock_symbol, "Unknown")
            val = h.current_value
            
            if total_portfolio_value > 0:
                pct = float((val / total_portfolio_value) * Decimal("100.0"))
            else:
                pct = 0.0
                
            sector_allocation[sector] = sector_allocation.get(sector, 0.0) + pct
            
            holdings_summary.append({
                "company_name": h.company_name,
                "symbol": h.stock_symbol,
                "quantity": h.quantity,
                "average_buy_price": float(h.average_buy_price),
                "current_price": float(h.current_price),
                "current_value": float(h.current_value),
                "profit_loss": float(h.profit_loss),
                "return_percentage": float(h.profit_loss_percentage),
                "sector": sector
            })

        # Format sector allocation
        formatted_sectors = []
        for sector, pct in sorted(sector_allocation.items(), key=lambda x: x[1], reverse=True):
            formatted_sectors.append(f"{sector} {round(pct, 1)}%")

        # 3. Recent Transactions
        recent_txs = Transaction.objects.filter(user=user).order_by("-created_at")[:10]
        formatted_txs = []
        for tx in recent_txs:
            formatted_txs.append({
                "type": tx.transaction_type,
                "symbol": tx.stock_symbol,
                "quantity": tx.quantity,
                "price": float(tx.price),
                "date": tx.created_at.strftime("%Y-%m-%d"),
                "total": float(tx.total_amount)
            })

        # 4. Watchlist (Optional, skipping if not heavily used, but let's check if Watchlist model exists)
        # Assuming no strict watchlist model found earlier, we'll return empty for now, or you can add if it exists.

        return {
            "has_portfolio": len(live_holdings) > 0,
            "summary": summary,
            "total_holdings": len(live_holdings),
            "holdings": holdings_summary,
            "sectors": formatted_sectors,
            "recent_transactions": formatted_txs
        }
