from django.urls import path
from .views import (
    top_gainers,
    top_losers,
    live_market_data,
    market_status,
    market_indices,
    market_sectors,
    market_all_stocks,
    market_gainers,
    market_losers,
    market_most_active,
    market_high_volume,
    market_heatmap,
    market_breadth,
    market_corporate_actions,
    market_upcoming_ipos,
    market_search,
    market_stock_detail,
    market_stock_history,
)

urlpatterns = [
    # ── Dashboard live polling ───────────────────────────────────────────────
    path("top-gainers/", top_gainers, name="top_gainers"),
    path("top-losers/", top_losers, name="top_losers"),
    path("live/", live_market_data, name="live_market_data"),
    path("status/", market_status, name="market_status"),

    # ── Markets page endpoints ───────────────────────────────────────────────
    path("indices/", market_indices, name="market_indices"),
    path("sectors/", market_sectors, name="market_sectors"),
    path("all-stocks/", market_all_stocks, name="market_all_stocks"),
    path("gainers/", market_gainers, name="market_gainers"),
    path("losers/", market_losers, name="market_losers"),
    path("most-active/", market_most_active, name="market_most_active"),
    path("high-volume/", market_high_volume, name="market_high_volume"),
    path("heatmap/", market_heatmap, name="market_heatmap"),
    path("market-breadth/", market_breadth, name="market_breadth"),
    path("corporate-actions/", market_corporate_actions, name="market_corporate_actions"),
    path("upcoming-ipos/", market_upcoming_ipos, name="market_upcoming_ipos"),
    path("search/", market_search, name="market_search"),
    path("stock/<str:symbol>/", market_stock_detail, name="market_stock_detail"),
    path("stock/<str:symbol>/history/", market_stock_history, name="market_stock_history"),
]
