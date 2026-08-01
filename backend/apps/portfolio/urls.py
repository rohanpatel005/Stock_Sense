from django.urls import path
from .views import PortfolioListView, PortfolioSummaryView

urlpatterns = [
    path('', PortfolioListView.as_view(), name='portfolio-list'),
    path('summary/', PortfolioSummaryView.as_view(), name='portfolio-summary'),
]
