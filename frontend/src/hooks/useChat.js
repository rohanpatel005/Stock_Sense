import { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/aiService';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await aiService.getHistory();
      // Assume history is an array of messages sorted by timestamp
      setMessages(history);
    } catch (err) {
      setError('Failed to load chat history. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await aiService.sendMessage(text);
      const aiMessage = {
        id: Date.now().toString() + '-ai',
        sender: 'AI',
        text: response.reply,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      // Remove the optimistic user message if failed? Or keep it and let user retry.
      // Usually keeping it and showing error is better, but this is simple.
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    setIsLoading(true);
    try {
      await aiService.clearHistory();
      setMessages([]);
    } catch (err) {
      setError('Failed to clear chat history.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    error,
    chatEndRef,
    sendMessage,
    clearChat,
  };
};
