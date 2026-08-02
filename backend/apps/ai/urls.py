from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.history_view, name='ai-history'),
    path('chat/', views.chat_view, name='ai-chat'),
]
