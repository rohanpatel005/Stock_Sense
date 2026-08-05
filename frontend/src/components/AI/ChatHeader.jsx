import React from 'react';
import { Bot, Trash2 } from 'lucide-react';

const ChatHeader = ({ onClearChat }) => {
  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E0A4]/20 to-[#00E0A4]/5 border border-[#00E0A4]/20 text-[#00E0A4] flex items-center justify-center shadow-[0_0_15px_rgba(0,224,164,0.1)]">
          <Bot className="w-6 h-6 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Mentor</h1>
          <p className="text-xs text-slate-400 font-medium">Your personal stock market mentor.</p>
        </div>
      </div>
      <button
        onClick={onClearChat}
        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all shadow-sm hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        title="Clear Chat"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
