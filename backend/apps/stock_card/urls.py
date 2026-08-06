from django.urls import path
from .views import get_stock_card, ai_analysis_view, latest_news_view

urlpatterns = [
    path("ai-analysis/", ai_analysis_view, name="ai_analysis_view"),
    path("<str:symbol>/news/", latest_news_view, name="latest_news_view"),
    path("<str:symbol>/", get_stock_card, name="get_stock_card"),
]
