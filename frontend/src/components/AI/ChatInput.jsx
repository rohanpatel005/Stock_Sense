import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-slate-100 p-4 shrink-0">
      <div className="max-w-4xl mx-auto relative flex items-end bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me anything about stocks, markets, or trading..."
          className="w-full max-h-[150px] bg-transparent text-slate-800 placeholder-slate-400 p-4 pr-14 resize-none outline-none text-[15px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
            input.trim() && !disabled
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="text-center mt-2">
        <span className="text-[11px] text-slate-400 font-medium">
          AI Mentor can make mistakes. Verify important information.
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
