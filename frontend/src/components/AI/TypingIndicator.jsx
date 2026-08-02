import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 w-full">
      <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
        <Bot className="w-5 h-5 text-emerald-700" />
      </div>
      <div className="bg-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5 w-fit">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
