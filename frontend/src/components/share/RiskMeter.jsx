
const RiskMeter = ({ data }) => {
  if (!data) return null;

  const score = data.score;
  const label = data.label;

  // Background map
  const colorMap = {
    'Low': 'bg-gradient-to-r from-[#00E0A4] to-[#00B37E] shadow-[0_0_8px_rgba(0,224,164,0.5)]',
    'Medium': 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_8px_rgba(96,165,250,0.5)]',
    'High': 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    'Very High': 'bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
  };

  const activeColor = colorMap[label] || 'bg-slate-400';

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card flex flex-col justify-between h-full hover-lift-card group">
      <div>
        <h3 className="text-lg font-bold text-white mb-6">Risk Profile</h3>
        
        {/* Risk meter indicator */}
        <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Level</div>
          <div className="text-2xl font-black text-white mt-1 drop-shadow-sm">{label}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Beta Indicator: {data.beta.toFixed(2)}</div>
          
          {/* Progress bar representing risk score */}
          <div className="w-4/5 bg-white/10 h-2.5 rounded-full mt-6 overflow-hidden shadow-inner">
            <div className={`h-full ${activeColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium leading-relaxed mt-5 text-center px-4 group-hover:text-slate-300 transition-colors">
          Risk classification is dynamic and calculated based on historical volatility (ATR), Beta vs Nifty 50, and drawdown statistics.
        </p>
      </div>

      <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider group">
        <span className="group-hover:text-slate-300 transition-colors">Volatility Rating</span>
        <span className="text-white font-extrabold text-sm px-3 py-1 bg-white/10 rounded-lg border border-white/5">{score > 50 ? 'Above Average' : 'Conservative'}</span>
      </div>
    </div>
  );
};

export default RiskMeter;
