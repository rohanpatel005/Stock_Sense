import logging
from decouple import config
from groq import Groq
from .prompts import CLASSIFIER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class QueryClassifier:
    @staticmethod
    def classify(user_message: str) -> tuple[bool, int]:
        """
        Classifies if the message is finance related or not.
        Returns:
            tuple[bool, int]: (True if FINANCE else False, total tokens used)
        """
        api_key = config('GROQ_API_KEY', default='')
        if not api_key:
            logger.error("Groq API key is missing for classification.")
            return True, 0  # Fail open if no key, though main API will fail anyway

        try:
            client = Groq(api_key=api_key)
            messages = [
                {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ]
            
            chat_completion = client.chat.completions.create(
                messages=messages,
                model="llama3-8b-8192",  # Fast lightweight model
                temperature=0.0, # Deterministic classification
                max_tokens=10
            )
            
            raw_response = chat_completion.choices[0].message.content.strip().upper()
            tokens_used = chat_completion.usage.total_tokens if getattr(chat_completion, 'usage', None) else 0
            
            logger.info(f"Classifier result: {raw_response} for query: '{user_message}'")
            
            if "NON_FINANCE" in raw_response:
                return False, tokens_used
                
            return True, tokens_used
            
        except Exception as e:
            logger.error(f"Classification failed: {str(e)}")
            # Fail open if the classifier API fails, let the main system prompt handle it
            return True, 0
