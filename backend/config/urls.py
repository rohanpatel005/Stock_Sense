from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    
    path("api/users/", include("apps.users.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/market/", include("apps.market.urls")),
    path("api/share/", include("apps.stock_card.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/portfolio/", include("apps.portfolio.urls")),
    path("api/ai/", include("apps.ai.urls")),
    path("api/settings/", include("apps.settings.urls")),
    path("api/watchlist/", include("apps.watchlist.urls")),
    path("api/", include("apps.dashboard.urls")),
]