import React from 'react';

const TechnicalSignals = ({ data }) => {
  if (!data) return null;

  const rec = data.recommendation;
  const buyPct = data.buy_percentage;
  
  // Highlight recommendation color
  const colorMap = {
    'Strong Buy': 'text-emerald-600 bg-emerald-50 border-emerald-200',
    'Buy': 'text-emerald-500 bg-emerald-50/50 border-emerald-100',
    'Neutral': 'text-slate-500 bg-slate-50 border-slate-200',
    'Sell': 'text-red-500 bg-red-50/50 border-red-100',
    'Strong Sell': 'text-red-600 bg-red-50 border-red-200'
  };

  const borderClass = colorMap[rec] || 'text-slate-500 bg-slate-50';

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Summary Signals</h3>
        
        {/* Gauge result */}
        <div className={`p-4 border rounded-2xl text-center font-bold ${borderClass}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-75">Aggregate Recommendation</div>
          <div className="text-xl mt-1">{rec}</div>
        </div>

        {/* Dial Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Sell ({100 - buyPct}%)</span>
            <span>Buy ({buyPct}%)</span>
          </div>
          <div className="h-3 bg-red-400 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${buyPct}%` }} />
          </div>
        </div>

        {/* Technical Reasons */}
        <div className="mt-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Technical Drivers</span>
          {data.reasons && data.reasons.map((r, idx) => (
            <div key={idx} className="text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
              • {r}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Trend Strength</span>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">{data.trend || 'Neutral'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Momentum</span>
          <span className="font-bold text-slate-800 text-xs sm:text-sm">{data.momentum || 'Neutral'}</span>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSignals;
