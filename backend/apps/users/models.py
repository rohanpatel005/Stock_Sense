from decimal import Decimal

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)
from django.core.validators import MinLengthValidator


class UserManager(BaseUserManager):

    def create_user(self, email, full_name, password=None, **extra_fields):

        if not email:
            raise ValueError("Email is required.")

        if not full_name:
            raise ValueError("Full name is required.")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            full_name=full_name,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_verified", True)

        return self.create_user(
            email=email,
            full_name=full_name,
            password=password,
            **extra_fields
        )

from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MinLengthValidator

class User(AbstractBaseUser, PermissionsMixin):

    

    full_name = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(3)]
    )

    email = models.EmailField(
        unique=True
    )

    wallet = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("50000.00")
    )

    google_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    AUTH_PROVIDER_CHOICES = [
        ('email', 'Email'),
        ('google', 'Google'),
    ]

    auth_provider = models.CharField(
        max_length=20,
        choices=AUTH_PROVIDER_CHOICES,
        default='email'
    )

    is_verified = models.BooleanField(
        default=False
    )

    otp = models.CharField(
        max_length=4,
        blank=True,
        null=True
    )

    

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.email
from django.db import models
from django.conf import settings

class Transaction(models.Model):

    TRANSACTION_CHOICES = [
        ("BUY", "Buy"),
        ("SELL", "Sell"),
    ]

    ORDER_STATUS = [
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("PENDING", "Pending"),
    ]

    ORDER_TYPE = [
        ("MARKET", "Market"),
        ("LIMIT", "Limit"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    stock_symbol = models.CharField(max_length=20)

    company_name = models.CharField(max_length=100)

    transaction_type = models.CharField(
        max_length=4,
        choices=TRANSACTION_CHOICES
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    order_type = models.CharField(
        max_length=10,
        choices=ORDER_TYPE,
        default="MARKET"
    )

    order_status = models.CharField(
        max_length=10,
        choices=ORDER_STATUS,
        default="SUCCESS"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.stock_symbol} ({self.transaction_type})"