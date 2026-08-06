
const SupportResistance = ({ data }) => {
  if (!data) return null;

  const formatVal = (val) => {
    return (val !== null && val !== undefined && !isNaN(val)) ? `₹${Number(val).toFixed(2)}` : 'N/A';
  };

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card flex flex-col justify-between h-full hover-lift-card group">
      <div>
        <h3 className="text-lg font-bold text-white mb-6">Support & Resistance</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Support Levels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider border-b border-red-500/20 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span> Support
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>S1 (Immediate)</span>
                <span className="font-bold text-white">{formatVal(data.s1)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>S2 (Major)</span>
                <span className="font-bold text-white">{formatVal(data.s2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>S3 (Strong)</span>
                <span className="font-bold text-white">{formatVal(data.s3)}</span>
              </div>
            </div>
          </div>

          {/* Resistance Levels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#00E0A4] uppercase tracking-wider border-b border-[#00E0A4]/20 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.8)]"></span> Resistance
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>R1 (Immediate)</span>
                <span className="font-bold text-white">{formatVal(data.r1)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>R2 (Major)</span>
                <span className="font-bold text-white">{formatVal(data.r2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                <span>R3 (Strong)</span>
                <span className="font-bold text-white">{formatVal(data.r3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">Nearest Breakout</span>
          <span className="font-extrabold text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)] text-xs sm:text-sm">{formatVal(data.nearest_breakout)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">Nearest Breakdown</span>
          <span className="font-extrabold text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] text-xs sm:text-sm">{formatVal(data.nearest_breakdown)}</span>
        </div>
      </div>
    </div>
  );
};

export default SupportResistance;
