import { useState, useRef, useEffect } from 'react';
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
    <div className="bg-transparent border-t border-white/5 p-4 shrink-0 backdrop-blur-md">
      <div className="max-w-4xl mx-auto relative flex items-end bg-[#0B1118]/60 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-lg focus-within:ring-2 focus-within:ring-[#00E0A4]/20 focus-within:border-[#00E0A4]/50 transition-all premium-glass-card group">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me anything about stocks, markets, or trading..."
          className="w-full max-h-[150px] bg-transparent text-white placeholder-slate-500 p-4 pl-6 pr-16 resize-none outline-none text-[15px] font-medium scrollbar-hide rounded-[24px]"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`absolute right-2.5 bottom-2.5 p-2.5 rounded-[16px] transition-all ${
            input.trim() && !disabled
              ? 'bg-gradient-to-r from-[#00E0A4] to-[#00B37E] hover:from-[#00E0A4] hover:to-[#00E0A4] text-[#05070D] shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] hover:-translate-y-0.5 scale-100'
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <SendHorizontal className="w-5 h-5 drop-shadow-md" />
        </button>
      </div>
      <div className="text-center mt-3">
        <span className="text-[11px] text-slate-500 font-medium tracking-wide">
          AI Mentor can make mistakes. Verify important information.
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
