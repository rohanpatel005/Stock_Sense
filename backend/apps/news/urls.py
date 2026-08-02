from django.urls import path
from . import views

urlpatterns = [
    path("latest/", views.latest_news_view, name="news_latest"),
    path("category/<str:category>/", views.category_news_view, name="news_category"),
    path("search/", views.search_news_view, name="news_search"),
]
