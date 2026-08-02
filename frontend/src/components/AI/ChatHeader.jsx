import React from 'react';
import { Bot, Trash2 } from 'lucide-react';

const ChatHeader = ({ onClearChat }) => {
  return (
    <div className="bg-white border-b border-slate-100 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Mentor</h1>
          <p className="text-xs text-slate-500 font-medium">Your personal stock market mentor.</p>
        </div>
      </div>
      <button
        onClick={onClearChat}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        title="Clear Chat"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
