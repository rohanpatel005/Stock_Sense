class PromptBuilder:
    @staticmethod
    def build_system_prompt(context: dict) -> str:
        """
        Constructs the system prompt injecting the user's financial context.
        """
        
        base_prompt = (
            "You are StockSense AI Mentor.\n"
            "You are an educational stock market mentor.\n"
            "Never guarantee profits.\n"
            "Never recommend buying or selling a stock.\n"
            "Never fabricate prices.\n"
            "If live market data is unavailable, clearly mention that.\n"
            "Explain concepts using beginner-friendly language.\n"
            "Always explain the reasoning behind educational suggestions.\n"
            "Be concise.\n"
            "Format responses using Markdown.\n"
            "------------------------------------------\n\n"
        )

        if not context.get("has_portfolio"):
            portfolio_section = (
                "AUTHENTICATED USER PORTFOLIO\n"
                "User currently has no active portfolio or holdings.\n"
                "Current Balance (Wallet): ₹{wallet}\n"
                "------------------------------------------\n"
            ).format(wallet=context.get("summary", {}).get("available_cash", 0.0))
            return base_prompt + portfolio_section
            
        # Summary
        s = context.get("summary", {})
        summary_str = (
            f"Current Balance (Wallet): ₹{s.get('available_cash', 0.0)}\n"
            f"Invested Amount: ₹{s.get('invested_amount', 0.0)}\n"
            f"Current Portfolio Value: ₹{s.get('current_portfolio_value', 0.0)}\n"
            f"Overall P&L: ₹{s.get('overall_profit_loss', 0.0)}\n"
            f"Overall Return: {s.get('total_return_percentage', 0.0)}%\n"
            f"Total Holdings: {context.get('total_holdings', 0)}\n"
        )
        
        # Sector Allocation
        sectors = context.get("sectors", [])
        sector_str = "Sector Allocation:\n" + (", ".join(sectors) if sectors else "Unknown")
        
        # Holdings
        holdings = context.get("holdings", [])
        holdings_str = "Holdings Summary (Top 15):\n"
        for h in holdings:
            holdings_str += f"- {h['company_name']} ({h['symbol']}): Qty {h['quantity']}, Avg ₹{h['average_buy_price']}, CMP ₹{h['current_price']}, Value ₹{h['current_value']}, P&L ₹{h['profit_loss']} ({h['return_percentage']}%)\n"
            
        # Transactions
        txs = context.get("recent_transactions", [])
        tx_str = "Recent Trades (Last 10):\n"
        if not txs:
            tx_str += "No recent trades.\n"
        else:
            for tx in txs:
                tx_str += f"- {tx['type']} {tx['quantity']} {tx['symbol']} @ ₹{tx['price']} on {tx['date']} (Total: ₹{tx['total']})\n"
                
        portfolio_section = (
            "AUTHENTICATED USER PORTFOLIO\n"
            f"{summary_str}\n"
            f"{sector_str}\n\n"
            f"{holdings_str}\n"
            f"{tx_str}\n"
            "------------------------------------------\n"
        )
        
        return base_prompt + portfolio_section
