import re
from decouple import config
from groq import Groq

def clean_ai_response(text: str) -> str:
    """
    Removes internal reasoning blocks and trims whitespace.
    """
    # Remove reasoning blocks wrapped in XML-like tags
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<thinking>.*?</thinking>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<reasoning>.*?</reasoning>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # Strip any other standalone XML-like tags (while being careful not to strip valid markdown, but the prompt asks for it)
    # The safest way is to target un-closed or empty ones if needed, but since the user requested "Strip any XML-like tags",
    # we can use a generic regex, however markdown might contain valid < or > so we only strip actual tags.
    text = re.sub(r'<[^>]+>', '', text)
    
    # Trim unnecessary consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

from .portfolio_context import PortfolioContextService
from .prompt_builder import PromptBuilder

def generate_ai_response(user_message: str, user, messages_history=None) -> str:
    """
    Interface with Groq API to generate an AI response.
    """
    api_key = config('GROQ_API_KEY', default='')
    
    if not api_key:
        return "Groq API key is missing. Please set GROQ_API_KEY in your backend/.env file."
        
    client = Groq(api_key=api_key)
    
    # Build Context
    try:
        user_context = PortfolioContextService.build_portfolio_context(user)
        system_content = PromptBuilder.build_system_prompt(user_context)
    except Exception as e:
        # Fallback to simple prompt if context building fails
        system_content = "You are StockSense AI Mentor. An error occurred fetching user portfolio data."

    # Construct message payload
    system_prompt = {
        "role": "system",
        "content": system_content
    }
    
    messages = [system_prompt]
    
    # Append history if provided
    if messages_history:
        for msg in messages_history:
            role = "user" if msg.sender == "USER" else "assistant"
            messages.append({"role": role, "content": msg.text})
            
    if not messages_history:
        messages.append({"role": "user", "content": user_message})

    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="qwen/qwen3.6-27b",
        )
        raw_content = chat_completion.choices[0].message.content
        return clean_ai_response(raw_content)
    except Exception as e:
        return f"Sorry, there was an error communicating with the AI service: {str(e)}"
