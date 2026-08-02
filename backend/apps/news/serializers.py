from rest_framework import serializers

class NewsSerializer(serializers.Serializer):
    title = serializers.CharField()
    summary = serializers.CharField()
    source = serializers.CharField()
    published = serializers.CharField()
    link = serializers.URLField()
    image = serializers.CharField(allow_blank=True)
    category = serializers.CharField()
