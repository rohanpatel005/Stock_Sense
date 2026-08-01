from django.urls import path
from .views import get_stock_card

urlpatterns = [
    path("<str:symbol>/", get_stock_card, name="get_stock_card"),
]
