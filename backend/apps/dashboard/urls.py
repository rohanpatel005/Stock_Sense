from django.urls import path
from .views import dashboard_data
from .market_views import top_gainers, top_losers

urlpatterns = [
    path("data/", dashboard_data, name="dashboard_data"),
    path("market/top-gainers/", top_gainers, name="top_gainers"),
    path("market/top-losers/", top_losers, name="top_losers"),
]
