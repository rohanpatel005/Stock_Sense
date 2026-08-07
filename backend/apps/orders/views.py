from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from .services import OrderService
from .serializers import OrderSerializer
from market.services import TradeService

class OrderPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class OrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # 0. Process pending orders before returning the list
        try:
            TradeService.process_pending_orders()
        except Exception:
            pass

        # 1. Fetch Summary
        summary = OrderService.get_order_summary(request.user)
        
        # 2. Fetch and Filter Orders
        filters = {
            'status': request.query_params.get('status'),
            'type': request.query_params.get('type'),
            'symbol': request.query_params.get('symbol')
        }
        
        queryset = OrderService.get_orders(request.user, filters)
        
        # 3. Serialize all Orders
        serializer = OrderSerializer(queryset, many=True)
        
        # 4. Return combined response
        return Response({
            "results": {
                "summary": summary,
                "orders": serializer.data
            }
        })
