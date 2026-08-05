import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatBubble = ({ message }) => {
  const isUser = message.sender === 'USER';

  return (
    <div className={`flex gap-4 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div 
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
          isUser ? 'bg-gradient-to-br from-[#00E0A4] to-[#00B37E] text-[#05070D] border-transparent shadow-[0_0_15px_rgba(0,224,164,0.3)]' : 'bg-[#0B1118]/80 border-white/10 text-[#00E0A4] shadow-[0_0_15px_rgba(0,224,164,0.1)]'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div 
        className={`px-5 py-4 max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-sm border ${
          isUser 
            ? 'bg-gradient-to-br from-[#00E0A4] to-[#00B37E] text-[#05070D] rounded-tr-sm border-transparent shadow-[0_5px_15px_rgba(0,224,164,0.2)]' 
            : 'bg-[#0B1118]/80 border-white/10 text-slate-300 rounded-tl-sm premium-glass-card'
        }`}
      >
        <div className={`prose prose-sm max-w-none ${isUser ? 'text-[#05070D]' : 'prose-invert text-slate-300'}`}>
          <ReactMarkdown>
            {message.text}
          </ReactMarkdown>
        </div>
        
        {/* Timestamp */}
        <div className={`text-[10px] mt-2 font-medium ${isUser ? 'text-[#05070D]/70 text-right' : 'text-slate-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
