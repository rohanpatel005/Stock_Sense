from django.db.models import Q
from users.models import Transaction

class OrderService:
    @staticmethod
    def get_orders(user, filters):
        """Fetch and filter orders for a specific user."""
        queryset = Transaction.objects.filter(user=user).order_by('-created_at')

        status = filters.get('status')
        txn_type = filters.get('type')
        symbol = filters.get('symbol')

        if status and status.upper() in ['SUCCESS', 'PENDING', 'FAILED']:
            queryset = queryset.filter(order_status=status.upper())
            
        if txn_type and txn_type.upper() in ['BUY', 'SELL']:
            queryset = queryset.filter(transaction_type=txn_type.upper())
            
        if symbol:
            queryset = queryset.filter(
                Q(stock_symbol__icontains=symbol) | 
                Q(company_name__icontains=symbol)
            )

        return queryset

    @staticmethod
    def get_order_summary(user):
        """Get summary counts for the user's orders."""
        queryset = Transaction.objects.filter(user=user)
        
        return {
            "total_orders": queryset.count(),
            "successful_orders": queryset.filter(order_status="SUCCESS").count(),
            "pending_orders": queryset.filter(order_status="PENDING").count(),
            "failed_orders": queryset.filter(order_status="FAILED").count(),
        }
