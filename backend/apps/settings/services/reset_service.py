import logging
from django.db import transaction
from django.utils import timezone
from apps.users.models import Portfolio, Transaction
from apps.ai.models import Conversation

logger = logging.getLogger(__name__)

class ResetError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code

class ResetPaperTradingService:
    @staticmethod
    def process_reset(user):
        # 2. Check and rollover monthly count if necessary
        now = timezone.now()
        if user.last_reset_date and user.last_reset_date.month != now.month:
            user.monthly_reset_count = 0
            
        # 3. Validate Limit
        if user.monthly_reset_count >= 3:
            raise ResetError("Monthly reset limit reached.", status_code=403)

        # 4. Transaction execution
        try:
            with transaction.atomic():
                Portfolio.objects.filter(user=user).delete()
                Transaction.objects.filter(user=user).delete()
                Conversation.objects.filter(user=user).delete()
                
                user.wallet = 50000.00
                user.monthly_reset_count += 1
                user.last_reset_date = now
                user.save()
                
                logger.info(f"User {user.email} reset their paper trading account. Count: {user.monthly_reset_count}")
                
        except Exception as e:
            logger.error(f"Error resetting account for {user.email}: {str(e)}")
            raise ResetError("Unable to reset account. Please try again later.", status_code=500)
