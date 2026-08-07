from django.urls import path
from .views import (
    # Dashboard live polling
    top_gainers,
    top_losers,
    top_active,
    live_market_data,

    # Markets page exact REST contract
    market_overview,
    market_search,
    market_gainers,
    market_losers,
    market_most_active,
    market_sectors,
    market_status,
    market_stock_detail,
    market_stock_history,
    market_news_latest,

    # Trading Endpoints
    buy_stock,
    sell_stock,
    pending_orders,
    order_preview,
)

urlpatterns = [
    # ── Legacy Dashboard Endpoints ──────────────────────────────────────────
    path("top-gainers/", top_gainers, name="top_gainers"),
    path("top-losers/", top_losers, name="top_losers"),
    path("top-active/", top_active, name="top_active"),
    path("live/", live_market_data, name="live_market_data"),

    # ── New Redesigned Market Page Endpoints (Exactly as requested) ──────────
    path("overview", market_overview, name="market_overview"),
    path("search", market_search, name="market_search"),
    path("gainers", market_gainers, name="market_gainers"),
    path("losers", market_losers, name="market_losers"),
    path("most-active", market_most_active, name="market_most_active"),
    path("sectors", market_sectors, name="market_sectors"),
    path("market-status", market_status, name="market_status"),
    
    # ── Stock Details & Chart History for Drawer ─────────────────────────────
    path("stock/<str:symbol>", market_stock_detail, name="market_stock_detail"),
    path("stock/<str:symbol>/history", market_stock_history, name="market_stock_history"),
    path("news/latest/", market_news_latest, name="market_news_latest"),

    # ── Trading Endpoints ────────────────────────────────────────────────────
    path("buy/", buy_stock, name="buy_stock"),
    path("sell/", sell_stock, name="sell_stock"),
    path("order-preview/", order_preview, name="order_preview"),
    path("pending-orders/", pending_orders, name="pending_orders"),
]
