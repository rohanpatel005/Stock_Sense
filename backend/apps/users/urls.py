from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, verify_registration_otp, login, google_register, forgot_password, verify_reset_otp, reset_password

urlpatterns = [
    path("register/", register, name="register"),
    path("verify-registration-otp/", verify_registration_otp, name="verify_registration_otp"),
    path("login/", login, name="login"),
    path("google-register/", google_register, name="google_register"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("verify-reset-otp/", verify_reset_otp, name="verify_reset_otp"),
    path("reset-password/", reset_password, name="reset_password"),
    
    # JWT token obtain and refresh endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
