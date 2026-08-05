import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-xl bg-[#0B1118]/80 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,224,164,0.1)]">
        <Bot className="w-5 h-5 text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
      </div>
      <div className="bg-[#0B1118]/80 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 w-fit premium-glass-card shadow-sm">
        <span className="w-2 h-2 bg-[#00E0A4]/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(0,224,164,0.6)]" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-[#00E0A4]/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(0,224,164,0.6)]" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-[#00E0A4]/80 rounded-full animate-bounce shadow-[0_0_8px_rgba(0,224,164,0.6)]" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
