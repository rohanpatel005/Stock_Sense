from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    
    path("api/users/", include("apps.users.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/market/", include("apps.market.urls")),
    path("api/share/", include("apps.stock_card.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/", include("apps.dashboard.urls")),
]