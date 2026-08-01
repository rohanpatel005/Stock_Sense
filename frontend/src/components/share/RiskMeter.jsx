import React from 'react';

const RiskMeter = ({ data }) => {
  if (!data) return null;

  const score = data.score;
  const label = data.label;

  // Background map
  const colorMap = {
    'Low': 'bg-emerald-500',
    'Medium': 'bg-blue-500',
    'High': 'bg-amber-500',
    'Very High': 'bg-red-500'
  };

  const activeColor = colorMap[label] || 'bg-slate-400';

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Risk Profile</h3>
        
        {/* Risk meter indicator */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Level</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{label}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Beta Indicator: {data.beta.toFixed(2)}</div>
          
          {/* Progress bar representing risk score */}
          <div className="w-4/5 bg-slate-200 h-2.5 rounded-full mt-6 overflow-hidden">
            <div className={`h-full ${activeColor}`} style={{ width: `${score}%` }}></div>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed mt-5 text-center px-4">
          Risk classification is dynamic and calculated based on historical volatility (ATR), Beta vs Nifty 50, and drawdown statistics.
        </p>
      </div>

      <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>Volatility Rating</span>
        <span className="text-slate-800 font-extrabold text-sm">{score > 50 ? 'Above Average' : 'Conservative'}</span>
      </div>
    </div>
  );
};

export default RiskMeter;
