from rest_framework import serializers
from apps.users.models import Portfolio

class PortfolioSerializer(serializers.ModelSerializer):
    # These fields might be dynamically updated by the service before serialization
    day_change_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Portfolio
        fields = [
            'id',
            'stock_symbol',
            'company_name',
            'quantity',
            'average_buy_price',
            'current_price',
            'invested_amount',
            'current_value',
            'profit_loss',
            'profit_loss_percentage',
            'day_change_percentage',
            'updated_at'
        ]

    def get_day_change_percentage(self, obj):
        # We will attach this dynamically in the service layer
        return getattr(obj, 'day_change_percentage', 0.0)
