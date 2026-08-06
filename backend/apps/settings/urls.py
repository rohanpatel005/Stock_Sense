from django.urls import path
from .views import settings_profile, reset_paper_account, request_reset_otp

urlpatterns = [
    path("profile/", settings_profile, name="settings_profile"),
    path("request-reset-otp/", request_reset_otp, name="request_reset_otp"),
    path("reset-paper-account/", reset_paper_account, name="reset_paper_account"),
]
