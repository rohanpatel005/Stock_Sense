import React from 'react';

const ValuationCard = ({ data }) => {
  if (!data) return null;

  const isPositive = data.upside_percent >= 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Valuation & Ratings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intrinsic Value</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 block mt-1">₹{data.intrinsic_value.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fair Value</span>
            <span className="text-base sm:text-lg font-extrabold text-slate-800 block mt-1">₹{data.fair_value.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Upside</span>
            <span className={`text-base font-extrabold block mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{data.upside_percent}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margin of Safety</span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">{data.margin_of_safety}%</span>
          </div>
        </div>

        {/* Scores */}
        <div className="mt-6 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Growth Score</span>
              <span>{data.growth_score}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${data.growth_score}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Value Score</span>
              <span>{data.value_score}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${data.value_score}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Quality Score</span>
              <span>{data.quality_score}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-[#0F766E]" style={{ width: `${data.quality_score}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span>Overall Verdict</span>
        <span className="text-slate-800 font-extrabold text-sm">{data.overall_rating}</span>
      </div>
    </div>
  );
};

export default ValuationCard;
