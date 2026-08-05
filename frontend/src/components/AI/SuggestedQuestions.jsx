import { Sparkles } from 'lucide-react';

const SuggestedQuestions = ({ onSelect }) => {
  const suggestions = [
    "Explain RSI",
    "What is Market Breadth?",
    "Explain PE Ratio",
    "What is Swing Trading?",
    "Explain Candlestick Patterns",
    "Review my Portfolio",
    "Explain today's market news"
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full h-full max-w-3xl mx-auto text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-[#00E0A4]/20 to-[#00E0A4]/5 border border-[#00E0A4]/20 text-[#00E0A4] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,224,164,0.15)] relative">
        <div className="absolute inset-0 bg-[#00E0A4]/10 blur-xl rounded-full"></div>
        <Sparkles className="w-8 h-8 relative z-10 drop-shadow-[0_0_8px_rgba(0,224,164,0.6)]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">How can I help you today?</h2>
      <p className="text-slate-400 mb-8 max-w-md font-medium">
        Ask me anything about the stock market, financial terms, or your portfolio strategies.
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm rounded-xl hover:border-[#00E0A4]/40 hover:text-[#00E0A4] hover:bg-[#00E0A4]/10 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-[0_4px_15px_rgba(0,224,164,0.15)] backdrop-blur-md"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
