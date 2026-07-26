from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register, verify_registration_otp, login, google_register

urlpatterns = [
    path("register/", register, name="register"),
    path("verify-registration-otp/", verify_registration_otp, name="verify_registration_otp"),
    path("login/", login, name="login"),
    path("google-register/", google_register, name="google_register"),
    
    # JWT token obtain and refresh endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
