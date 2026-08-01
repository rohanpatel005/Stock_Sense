from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import PortfolioService
from .serializers import PortfolioSerializer

class PortfolioListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        live_holdings = PortfolioService.get_live_portfolio(request.user)
        serializer = PortfolioSerializer(live_holdings, many=True)
        return Response(serializer.data)

class PortfolioSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # By separating summary view, frontend can refresh just the summary if needed,
        # but usually we want to fetch both.
        summary = PortfolioService.get_portfolio_summary(request.user)
        return Response(summary)
