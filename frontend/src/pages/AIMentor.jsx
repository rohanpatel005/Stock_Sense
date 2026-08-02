import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import ChatHeader from '../components/AI/ChatHeader';
import ChatBubble from '../components/AI/ChatBubble';
import ChatInput from '../components/AI/ChatInput';
import SuggestedQuestions from '../components/AI/SuggestedQuestions';
import TypingIndicator from '../components/AI/TypingIndicator';

const AIMentor = () => {
  const {
    messages,
    isLoading,
    isTyping,
    error,
    chatEndRef,
    sendMessage,
    clearChat,
  } = useChat();

  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearConfirm = () => {
    clearChat();
    setShowClearModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader onClearChat={() => setShowClearModal(true)} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-slate-50/50">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm font-semibold border border-red-100">
              {error}
            </div>
          )}

          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <SuggestedQuestions onSelect={sendMessage} />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <TypingIndicator />
              )}
              
              <div ref={chatEndRef} />
            </>
          )}
        </div>
      </div>

      <ChatInput onSend={sendMessage} disabled={isTyping} />

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Clear Conversation?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              This will permanently delete your chat history. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-sm"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIMentor;
