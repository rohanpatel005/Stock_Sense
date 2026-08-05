from django.urls import path
from . import views

urlpatterns = [
    path('', views.watchlist_list, name='watchlist-list'),
    path('<str:symbol>/', views.watchlist_detail, name='watchlist-detail'),
]
