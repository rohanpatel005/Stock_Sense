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

def generate_ai_response(user_message: str, messages_history=None) -> str:
    """
    Interface with Groq API to generate an AI response.
    """
    api_key = config('GROQ_API_KEY', default='')
    
    if not api_key:
        return "Groq API key is missing. Please set GROQ_API_KEY in your backend/.env file."
        
    client = Groq(api_key=api_key)
    
    # Construct message payload
    system_prompt = {
        "role": "system",
        "content": "You are a helpful, professional AI Mentor for a stock market application called StockSense. You help users understand financial terms, trading strategies, and analyze markets. Answer in clean Markdown format."
    }
    
    messages = [system_prompt]
    
    # Append history if provided
    if messages_history:
        for msg in messages_history:
            role = "user" if msg.sender == "USER" else "assistant"
            messages.append({"role": role, "content": msg.text})
            
    # Append the latest user message
    # Wait, the views.py saves the user_message BEFORE calling this, 
    # so messages_history will already contain the latest user message if we pass all messages.
    # We need to make sure we don't duplicate it. 
    # To keep it simple, we just pass the history as-is if we pass all messages up to the current one.

    # If views.py doesn't pass history yet, we just append the single message
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
