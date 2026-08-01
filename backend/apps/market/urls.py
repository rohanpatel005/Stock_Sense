from django.urls import path
from .views import (
    # Dashboard live polling
    top_gainers,
    top_losers,
    live_market_data,
    market_status_legacy,

    # Markets page exact REST contract
    market_overview,
    market_search,
    market_gainers,
    market_losers,
    market_most_active,
    market_sectors,
    market_breadth,
    market_status,
    market_stock_detail,
    market_stock_history,
)

urlpatterns = [
    # ── Legacy Dashboard Endpoints ──────────────────────────────────────────
    path("top-gainers/", top_gainers, name="top_gainers"),
    path("top-losers/", top_losers, name="top_losers"),
    path("live/", live_market_data, name="live_market_data"),
    path("status/", market_status_legacy, name="market_status_legacy"),

    # ── New Redesigned Market Page Endpoints (Exactly as requested) ──────────
    path("overview", market_overview, name="market_overview"),
    path("search", market_search, name="market_search"),
    path("gainers", market_gainers, name="market_gainers"),
    path("losers", market_losers, name="market_losers"),
    path("most-active", market_most_active, name="market_most_active"),
    path("sectors", market_sectors, name="market_sectors"),
    path("breadth", market_breadth, name="market_breadth"),
    path("market-status", market_status, name="market_status"),
    
    # ── Stock Details & Chart History for Drawer ─────────────────────────────
    path("stock/<str:symbol>", market_stock_detail, name="market_stock_detail"),
    path("stock/<str:symbol>/history", market_stock_history, name="market_stock_history"),
]
