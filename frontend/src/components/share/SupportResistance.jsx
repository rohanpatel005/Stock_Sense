import React from 'react';

const SupportResistance = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Support & Resistance</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Support Levels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider border-b border-red-50 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Support
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>S1 (Immediate)</span>
                <span className="font-bold">₹{data.s1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>S2 (Major)</span>
                <span className="font-bold">₹{data.s2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>S3 (Strong)</span>
                <span className="font-bold">₹{data.s3.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Resistance Levels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-50 pb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Resistance
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>R1 (Immediate)</span>
                <span className="font-bold">₹{data.r1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>R2 (Major)</span>
                <span className="font-bold">₹{data.r2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>R3 (Strong)</span>
                <span className="font-bold">₹{data.r3.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-50 pt-4">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Nearest Breakout</span>
          <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">₹{data.nearest_breakout.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Nearest Breakdown</span>
          <span className="font-extrabold text-red-500 text-xs sm:text-sm">₹{data.nearest_breakdown.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default SupportResistance;
