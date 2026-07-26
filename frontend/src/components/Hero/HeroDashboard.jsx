import React from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';

const HeroDashboard = () => {
  return (
    <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center select-none">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Portfolio Profit Card */}
        <div className="absolute top-10 right-4 lg:right-12 glass-card p-6 rounded-3xl shadow-2xl z-20 w-64 hover-lift">
          <div className="flex justify-between items-start mb-4">
            <div className="text-body-sm font-semibold text-on-surface-variant">Portfolio Profit</div>
            <TrendingUp className="text-primary w-5 h-5" />
          </div>
          <div className="text-headline-md font-bold text-primary">₹1,42,840.00</div>
          <div className="text-label-caps text-primary mt-1">+12.4% THIS MONTH</div>
        </div>

        {/* AI Prediction Card */}
        <div className="absolute bottom-10 left-4 lg:left-12 ai-glass p-6 rounded-3xl shadow-2xl z-20 w-72 hover-lift">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-secondary w-5 h-5 fill-secondary" />
            <div className="text-body-sm font-bold text-secondary">AI PREDICTION</div>
          </div>
          <div className="text-body-md font-bold mb-1">Bullish Sentiment Detected</div>
          <p className="text-body-sm text-on-surface-variant">
            NIFTY 50 showing strong support at 22,400 levels. Targets: 22,850.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboard;
