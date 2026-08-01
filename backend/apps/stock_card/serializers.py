from rest_framework import serializers

class StockCardResponseSerializer(serializers.Serializer):
    # This serializer is used for documentation and contracts
    symbol = serializers.CharField()
    company_name = serializers.CharField()
    exchange = serializers.CharField()
    sector = serializers.CharField()
    industry = serializers.CharField()
    cap_category = serializers.CharField()
    live_price = serializers.FloatField()
    today_change = serializers.FloatField()
    today_change_percent = serializers.FloatField()
    market_status = serializers.CharField()
    last_updated = serializers.CharField()
    
    # We will serialize dynamically in the view for maximum performance and flexible nested outputs
