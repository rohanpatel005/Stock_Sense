import React from 'react';
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
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you today?</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Ask me anything about the stock market, financial terms, or your portfolio strategies.
      </p>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
