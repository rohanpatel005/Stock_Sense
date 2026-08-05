from django.db import models
from django.conf import settings

class Watchlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='watchlists')
    symbol = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'symbol')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.symbol}"
