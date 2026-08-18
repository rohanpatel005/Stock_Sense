from rest_framework import serializers
from users.models import Transaction

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'id',
            'stock_symbol',
            'company_name',
            'transaction_type',
            'quantity',
            'price',
            'total_amount',
            'order_type',
            'order_status',
            'created_at'
        ]
