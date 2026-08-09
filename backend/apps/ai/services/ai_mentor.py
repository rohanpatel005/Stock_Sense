import logging
import time
import re
from decouple import config
from groq import Groq
from .portfolio_context import PortfolioContextService
from .prompt_builder import PromptBuilder
from .classifier import QueryClassifier

logger = logging.getLogger(__name__)

def clean_ai_response(text: str) -> str:
    """
    Removes internal reasoning blocks and trims whitespace.
    """
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<reasoning>.*?</reasoning>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def generate_ai_response(user_message: str, user, messages_history=None) -> str:
    """
    Orchestrates the classification and AI response generation.
    """
    start_time = time.time()
    logger.info(f"Received user question: '{user_message}'")
    
    # 1. Classify the query
    is_finance, classifier_tokens = QueryClassifier.classify(user_message)
    
    if not is_finance:
        logger.info(f"Query classified as NON_FINANCE. Main AI model was NOT called.")
        logger.info(f"Response Time: {time.time() - start_time:.2f}s | Token usage: {classifier_tokens}")
        return "I am StockSense AI Mentor. I can only answer questions related to stocks, investing, finance, and financial markets."

    # 2. Proceed with Main AI Generation
    logger.info(f"Query classified as FINANCE. Calling main AI Mentor.")
    
    api_key = config('GROQ_API_KEY', default='')
    if not api_key:
        return "Groq API key is missing. Please set GROQ_API_KEY in your backend/.env file."
        
    client = Groq(api_key=api_key)
    
    try:
        user_context = PortfolioContextService.build_portfolio_context(user)
        system_content = PromptBuilder.build_system_prompt(user_context)
    except Exception as e:
        logger.error(f"Error building portfolio context: {e}")
        system_content = "You are StockSense AI Mentor. An error occurred fetching user portfolio data."

    messages = [
        {"role": "system", "content": system_content}
    ]
    
    if messages_history:
        for msg in messages_history:
            role = "user" if msg.sender == "USER" else "assistant"
            messages.append({"role": role, "content": msg.text})
            
    if not messages_history:
        messages.append({"role": "user", "content": user_message})

    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        
        raw_content = chat_completion.choices[0].message.content
        generation_tokens = chat_completion.usage.total_tokens if getattr(chat_completion, 'usage', None) else 0
        total_tokens = classifier_tokens + generation_tokens
        
        logger.info(f"Response Time: {time.time() - start_time:.2f}s | Token usage: {total_tokens} (Classifier: {classifier_tokens}, Mentor: {generation_tokens})")
        
        return clean_ai_response(raw_content)
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        raise Exception("An internal error occurred while connecting to the AI Mentor.")
