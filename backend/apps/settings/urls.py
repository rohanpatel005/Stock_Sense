from django.urls import path
from .views import settings_profile, reset_paper_account

urlpatterns = [
    path("profile/", settings_profile, name="settings_profile"),
    path("reset-paper-account/", reset_paper_account, name="reset_paper_account"),
]
