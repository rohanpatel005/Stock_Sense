from django.db import models


class TopGainerMarket(models.Model):
    """DB cache for top gainers (Market app copy, independent of Dashboard)."""
    symbol         = models.CharField(max_length=20)
    name           = models.CharField(max_length=100)
    price          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    change_rs      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    change_percent = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    volume         = models.CharField(max_length=20, default='')
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-change_percent']

    def __str__(self):
        return f"{self.symbol} ({self.change_percent}%)"


class TopLoserMarket(models.Model):
    """DB cache for top losers (Market app copy, independent of Dashboard)."""
    symbol         = models.CharField(max_length=20)
    name           = models.CharField(max_length=100)
    price          = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    change_rs      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    change_percent = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    volume         = models.CharField(max_length=20, default='')
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['change_percent']

    def __str__(self):
        return f"{self.symbol} ({self.change_percent}%)"
