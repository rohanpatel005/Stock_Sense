import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatBubble = ({ message }) => {
  const isUser = message.sender === 'USER';

  return (
    <div className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div 
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
          isUser ? 'bg-[#2563EB] text-white' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div 
        className={`px-5 py-4 max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-[#2563EB] text-white rounded-tr-sm' 
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : 'prose-slate'}`}>
          <ReactMarkdown>
            {message.text}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp */}
        <div className={`text-[10px] mt-2 font-medium ${isUser ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
