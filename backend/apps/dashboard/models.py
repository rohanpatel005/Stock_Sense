from django.db import models

class TopGainer(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    change_rs = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=7, decimal_places=2)
    volume = models.CharField(max_length=30)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} (+{self.change_percent}%)"


class TopLoser(models.Model):
    symbol = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    change_rs = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=7, decimal_places=2)
    volume = models.CharField(max_length=30)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} ({self.change_percent}%)"
