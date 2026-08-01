from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .services import OrderService
from .serializers import OrderSerializer

class OrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class OrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 1. Fetch Summary
        summary = OrderService.get_order_summary(request.user)
        
        # 2. Fetch and Filter Orders
        filters = {
            'status': request.query_params.get('status'),
            'type': request.query_params.get('type'),
            'symbol': request.query_params.get('symbol')
        }
        
        queryset = OrderService.get_orders(request.user, filters)
        
        # 3. Paginate Orders
        paginator = OrderPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = OrderSerializer(paginated_queryset, many=True)
        
        # 4. Return combined response
        return paginator.get_paginated_response({
            "summary": summary,
            "orders": serializer.data
        })
