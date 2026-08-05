import React from 'react';

const ValuationCard = ({ data }) => {
  if (!data) return null;

  const isPositive = data.upside_percent >= 0;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card flex flex-col justify-between h-full hover-lift-card">
      <div>
        <h3 className="text-lg font-bold text-white mb-6">Valuation & Ratings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover-lift-card group transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-slate-300">Intrinsic Value</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">₹{data.intrinsic_value.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover-lift-card group transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-slate-300">Fair Value</span>
            <span className="text-base sm:text-lg font-extrabold text-white block mt-1">₹{data.fair_value.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover-lift-card transition-all">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-slate-300">Estimated Upside</span>
            <span className={`text-base font-extrabold block mt-0.5 ${isPositive ? 'text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>
              {isPositive ? '+' : ''}{data.upside_percent}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block group-hover:text-slate-300">Margin of Safety</span>
            <span className="text-base font-extrabold text-white block mt-0.5">{data.margin_of_safety}%</span>
          </div>
        </div>

        {/* Scores */}
        <div className="mt-6 space-y-4">
          <div className="group">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 group-hover:text-slate-300 transition-colors">
              <span>Growth Score</span>
              <span className="text-white font-bold">{data.growth_score}/100</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] shadow-[0_0_8px_rgba(0,224,164,0.8)] rounded-full transition-all duration-1000" style={{ width: `${data.growth_score}%` }}></div>
            </div>
          </div>
          <div className="group">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 group-hover:text-slate-300 transition-colors">
              <span>Value Score</span>
              <span className="text-white font-bold">{data.value_score}/100</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_8px_rgba(96,165,250,0.8)] rounded-full transition-all duration-1000" style={{ width: `${data.value_score}%` }}></div>
            </div>
          </div>
          <div className="group">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5 group-hover:text-slate-300 transition-colors">
              <span>Quality Score</span>
              <span className="text-white font-bold">{data.quality_score}/100</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.8)] rounded-full transition-all duration-1000" style={{ width: `${data.quality_score}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 mt-6 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider group">
        <span className="group-hover:text-slate-300 transition-colors">Overall Verdict</span>
        <span className="text-white font-extrabold text-sm px-3 py-1 bg-white/10 rounded-lg border border-white/5">{data.overall_rating}</span>
      </div>
    </div>
  );
};

export default ValuationCard;
