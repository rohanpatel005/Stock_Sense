import logging
import json
from decouple import config
from groq import Groq

logger = logging.getLogger(__name__)

class GroqStockAnalystService:
    @staticmethod
    def generate_analysis(stock_data: dict) -> str:
        api_key = config('GROQ_API_KEY', default='')
        if not api_key:
            raise ValueError("Groq API key is missing. Please set GROQ_API_KEY.")
            
        client = Groq(api_key=api_key)
        
        # 1. Build structured JSON object with only required data
        ai_payload = {
            "Company": {
                "Name": stock_data.get("company_name"),
                "Symbol": stock_data.get("symbol"),
                "Sector": stock_data.get("sector"),
                "Industry": stock_data.get("industry")
            },
            "Market": {
                "Current Price": stock_data.get("live_price"),
                "Today's Change": stock_data.get("today_change_percent"),
                "Market Cap": stock_data.get("profile", {}).get("market_cap")
            },
            "Valuation": {
                "PE": stock_data.get("financial_highlights", {}).get("pe"),
                "PB": stock_data.get("financial_highlights", {}).get("pb"),
                "PEG": stock_data.get("financial_highlights", {}).get("peg"),
                "EPS": stock_data.get("financial_highlights", {}).get("eps"),
                "Intrinsic Value": stock_data.get("valuation", {}).get("intrinsic_value"),
                "Fair Value": stock_data.get("valuation", {}).get("fair_value"),
                "Margin of Safety": stock_data.get("valuation", {}).get("margin_of_safety")
            },
            "Technical Indicators": {
                "RSI": stock_data.get("technical_indicators", {}).get("rsi"),
                "MACD": stock_data.get("technical_indicators", {}).get("macd_line"),
                "EMA20": stock_data.get("technical_indicators", {}).get("ema_20"),
                "EMA50": stock_data.get("technical_indicators", {}).get("ema_50"),
                "EMA200": stock_data.get("technical_indicators", {}).get("ema_200"),
                "ADX": stock_data.get("technical_indicators", {}).get("adx"),
                "MFI": stock_data.get("technical_indicators", {}).get("mfi")
            },
            "Support Resistance": {
                "S1": stock_data.get("support_resistance", {}).get("s1"),
                "S2": stock_data.get("support_resistance", {}).get("s2"),
                "S3": stock_data.get("support_resistance", {}).get("s3"),
                "R1": stock_data.get("support_resistance", {}).get("r1"),
                "R2": stock_data.get("support_resistance", {}).get("r2"),
                "R3": stock_data.get("support_resistance", {}).get("r3")
            },
            "Recommendation": {
                "Buy %": stock_data.get("technical_signals", {}).get("buy_percentage"),
                "Sell %": 100 - stock_data.get("technical_signals", {}).get("buy_percentage", 50) if stock_data.get("technical_signals", {}).get("buy_percentage") is not None else None,
                "Overall Recommendation": stock_data.get("technical_signals", {}).get("recommendation"),
                "Trend": stock_data.get("technical_signals", {}).get("trend"),
                "Momentum": stock_data.get("technical_signals", {}).get("momentum"),
                "Risk Level": stock_data.get("risk_meter", {}).get("label")
            },
            "Fundamentals": {
                "Revenue": stock_data.get("financial_highlights", {}).get("revenue"),
                "Net Profit": stock_data.get("financial_highlights", {}).get("net_profit"),
                "ROE": stock_data.get("financial_highlights", {}).get("roe"),
                "ROCE": stock_data.get("financial_highlights", {}).get("roce"),
                "Debt Equity": stock_data.get("financial_highlights", {}).get("debt_to_equity"),
                "Current Ratio": stock_data.get("financial_highlights", {}).get("current_ratio"),
                "Operating Margin": stock_data.get("financial_highlights", {}).get("operating_margin")
            },
            "Shareholding": {
                "Promoters": stock_data.get("ownership", {}).get("promoters"),
                "FII": stock_data.get("ownership", {}).get("fii"),
                "DII": stock_data.get("ownership", {}).get("dii"),
                "Public": stock_data.get("ownership", {}).get("public")
            },
            "Historical Returns": {
                "1 Week": stock_data.get("performance", {}).get("weekly"),
                "1 Month": stock_data.get("performance", {}).get("monthly"),
                "3 Month": stock_data.get("performance", {}).get("three_month"),
                "1 Year": stock_data.get("performance", {}).get("one_year")
            },
            "Recent News": [news.get("title") for news in stock_data.get("news", [])[:5]]
        }

        # Remove None values
        def clean_dict(d):
            if isinstance(d, dict):
                return {k: clean_dict(v) for k, v in d.items() if v is not None}
            elif isinstance(d, list):
                return [clean_dict(i) for i in d if i is not None]
            return d
            
        ai_payload = clean_dict(ai_payload)

        # 2. System Prompt
        system_prompt = """You are an expert Indian Stock Market Research Analyst.

Use ONLY the supplied JSON.
Never invent numbers.
Never assume missing information.
Never give financial guarantees.
Never predict exact future prices.
Explain the stock in a professional manner suitable for beginner and intermediate investors.

The AI response should be structured EXACTLY into these markdown sections:

# Overall Summary
2-3 paragraphs.

# Fundamental Analysis
- Strengths
- Weaknesses
Score out of 10.

# Technical Analysis
Explain Trend, Momentum, RSI, MACD, EMA, Support, and Resistance.

# Valuation
Explain whether Undervalued, Fairly Valued, or Overvalued using available metrics.

# Risk Analysis
Mention Business Risk, Technical Risk, Valuation Risk, and Volatility Risk.

# Suitable For
Choose from: Long Term Investor, Swing Trader, Value Investor, Dividend Investor, Short Term Trader.

# AI Verdict
Return one of: Strong Buy, Buy, Hold, Reduce, Sell.
Include confidence percentage. Explain the reasoning.
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze this stock data:\n{json.dumps(ai_payload, indent=2)}"}
        ]

        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile", # Updated to latest working groq model
                temperature=0.3
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API error during stock analysis: {e}")
            raise e
