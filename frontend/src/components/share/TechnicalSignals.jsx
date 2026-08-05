import React from 'react';

const TechnicalSignals = ({ data }) => {
  if (!data) return null;

  const rec = data.recommendation;
  const buyPct = data.buy_percentage;
  
  // Highlight recommendation color
  const colorMap = {
    'Strong Buy': 'text-[#00E0A4] bg-gradient-to-br from-[#00E0A4]/20 to-[#00E0A4]/5 border-[#00E0A4]/30 shadow-[0_0_15px_rgba(0,224,164,0.15)]',
    'Buy': 'text-[#00E0A4] bg-[#00E0A4]/10 border-[#00E0A4]/20',
    'Neutral': 'text-slate-300 bg-white/5 border-white/10',
    'Sell': 'text-red-400 bg-red-400/10 border-red-400/20',
    'Strong Sell': 'text-red-400 bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
  };

  const borderClass = colorMap[rec] || 'text-slate-300 bg-white/5 border-white/10';

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card flex flex-col justify-between h-full hover-lift-card group">
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Summary Signals</h3>
        
        {/* Gauge result */}
        <div className={`p-4 border rounded-[16px] text-center font-bold ${borderClass}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-75">Aggregate Recommendation</div>
          <div className="text-xl mt-1 drop-shadow-md">{rec}</div>
        </div>

        {/* Dial Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span>Sell ({100 - buyPct}%)</span>
            <span>Buy ({buyPct}%)</span>
          </div>
          <div className="h-3 bg-red-500/20 rounded-full overflow-hidden flex shadow-inner">
            <div className="bg-gradient-to-r from-[#00E0A4] to-[#00B37E] shadow-[0_0_10px_rgba(0,224,164,0.5)] h-full transition-all duration-1000" style={{ width: `${buyPct}%` }} />
          </div>
        </div>

        {/* Technical Reasons */}
        <div className="mt-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Technical Drivers</span>
          {data.reasons && data.reasons.map((r, idx) => (
            <div key={idx} className="text-xs font-semibold text-slate-300 bg-white/5 p-2.5 rounded-[12px] border border-white/10 shadow-sm">
              • {r}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Trend Strength</span>
          <span className="font-bold text-white text-xs sm:text-sm">{data.trend || 'Neutral'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Momentum</span>
          <span className="font-bold text-white text-xs sm:text-sm">{data.momentum || 'Neutral'}</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSignals;
