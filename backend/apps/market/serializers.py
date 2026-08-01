from rest_framework import serializers

class BuyOrderSerializer(serializers.Serializer):
    stock_symbol = serializers.CharField(max_length=20)
    company_name = serializers.CharField(max_length=100)
    quantity = serializers.IntegerField(min_value=1)
    order_type = serializers.ChoiceField(choices=["MARKET", "LIMIT"], default="MARKET")
    limit_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    def validate(self, data):
        if data.get("order_type") == "LIMIT" and not data.get("limit_price"):
            raise serializers.ValidationError("Limit price is required for LIMIT orders.")
        return data


class SellOrderSerializer(serializers.Serializer):
    stock_symbol = serializers.CharField(max_length=20)
    quantity = serializers.IntegerField(min_value=1)
    order_type = serializers.ChoiceField(choices=["MARKET", "LIMIT"], default="MARKET")
    limit_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    def validate(self, data):
        if data.get("order_type") == "LIMIT" and not data.get("limit_price"):
            raise serializers.ValidationError("Limit price is required for LIMIT orders.")
        return data


class OrderPreviewSerializer(serializers.Serializer):
    stock_symbol = serializers.CharField(max_length=20)
    quantity = serializers.IntegerField(min_value=1)
    order_type = serializers.ChoiceField(choices=["BUY", "SELL"])
