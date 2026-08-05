from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Watchlist
from .serializers import WatchlistSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_list(request):
    if request.method == 'GET':
        watchlists = Watchlist.objects.filter(user=request.user)
        serializer = WatchlistSerializer(watchlists, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Check if it already exists
        symbol = request.data.get('symbol')
        if not symbol:
            return Response({"error": "Symbol is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        if Watchlist.objects.filter(user=request.user, symbol=symbol).exists():
            return Response({"error": "Stock is already in watchlist."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = WatchlistSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def watchlist_detail(request, symbol):
    try:
        watchlist_item = Watchlist.objects.get(user=request.user, symbol=symbol)
    except Watchlist.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        watchlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
