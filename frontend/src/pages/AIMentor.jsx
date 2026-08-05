import { useState } from 'react';
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
    <div className="flex flex-col flex-1 h-[calc(100vh-64px)] lg:h-screen w-full relative z-10 bg-transparent">
      <ChatHeader onClearChat={() => setShowClearModal(true)} />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth relative z-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-[16px] text-center text-sm font-bold border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}

          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-[#00E0A4] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,224,164,0.5)]"></div>
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
        <div className="fixed inset-0 bg-[#05070D]/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] premium-glass-card">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Clear Conversation?</h3>
            <p className="text-slate-400 mb-6 text-sm font-medium">
              This will permanently delete your chat history. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-5 py-2.5 text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearConfirm}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:-translate-y-0.5"
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
