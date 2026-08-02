from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .services import generate_ai_response

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def history_view(request):
    """
    GET: Returns the user's most recent conversation history.
    DELETE: Clears the conversation.
    """
    user = request.user
    
    if request.method == 'GET':
        conversation = Conversation.objects.filter(user=user).first()
        if not conversation:
            return Response([])
            
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    elif request.method == 'DELETE':
        Conversation.objects.filter(user=user).delete()
        return Response({"message": "Conversation cleared"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """
    Receives a message, saves it, gets AI response, saves AI response, and returns the response.
    """
    user = request.user
    message_text = request.data.get('message')
    
    if not message_text:
        return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    # Get or create active conversation
    conversation = Conversation.objects.filter(user=user).first()
    if not conversation:
        conversation = Conversation.objects.create(user=user)
        
    # Save User message
    user_message = Message.objects.create(
        conversation=conversation,
        sender='USER',
        text=message_text
    )
    
    # Generate AI response
    try:
        reply_text = generate_ai_response(message_text)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # Save AI message
    ai_message = Message.objects.create(
        conversation=conversation,
        sender='AI',
        text=reply_text
    )
    
    # Return response in expected format
    return Response({
        "reply": ai_message.text,
        "timestamp": ai_message.timestamp,
        "conversation_id": conversation.id
    })
