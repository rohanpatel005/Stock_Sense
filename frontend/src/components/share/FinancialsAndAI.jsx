import React from 'react';
import { Sparkles } from 'lucide-react';

export const FinancialHighlights = ({ data }) => {
  if (!data) return null;

  const metrics = [
    { label: 'Revenue', value: data.revenue ? `₹${(data.revenue / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'Net Profit', value: data.net_profit ? `₹${(data.net_profit / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'EBITDA', value: data.ebitda ? `₹${(data.ebitda / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'ROE', value: `${data.roe}%` },
    { label: 'ROCE', value: `${data.roce}%` },
    { label: 'EPS', value: `₹${data.eps.toFixed(2)}` },
    { label: 'PE Ratio', value: data.pe ? data.pe.toFixed(2) : '—' },
    { label: 'PB Ratio', value: data.pb ? data.pb.toFixed(2) : '—' },
    { label: 'PEG Ratio', value: data.peg ? data.peg.toFixed(2) : '—' },
    { label: 'Debt to Equity', value: data.debt_to_equity.toFixed(2) },
    { label: 'Current Ratio', value: data.current_ratio.toFixed(2) },
    { label: 'Operating Margin', value: `${data.operating_margin}%` }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Financial Highlights</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => (
          <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
            <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase">{item.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1.5">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIAnalysis = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-emerald-950/5 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-3xl space-y-6">
      <div className="flex items-center gap-2 text-[#0F766E]">
        <Sparkles className="w-5 h-5 fill-[#0F766E]/10" />
        <h3 className="font-bold text-sm tracking-wider uppercase">AI Technical Insights</h3>
      </div>
      
      <div className="space-y-3.5">
        <div className="bg-white/60 p-3.5 rounded-xl border border-white/40 text-xs">
          <strong className="text-slate-700 block mb-1">Estimated Trend & Strength:</strong>
          <span className="text-slate-600 font-semibold">{data.strength} {data.trend} Momentum</span>
        </div>
        <div className="bg-white/60 p-3.5 rounded-xl border border-white/40 text-xs">
          <strong className="text-slate-700 block mb-1">Growth & Volatility Risks:</strong>
          <span className="text-slate-600 font-semibold">{data.risk} ({data.volatility} Volatility)</span>
        </div>
        <div className="bg-white/60 p-3.5 rounded-xl border border-white/40 text-xs">
          <strong className="text-slate-700 block mb-1">Key Observation:</strong>
          <span className="text-slate-600 font-semibold">{data.suggested_observation}</span>
        </div>
      </div>

      <div className="border-t border-[#0F766E]/10 pt-4 flex justify-between items-baseline">
        <span className="text-xs text-slate-500 font-bold">Bullish/Bearish Bias Score</span>
        <span className="text-lg font-black text-[#0F766E]">{data.bullish_score}% Bullish</span>
      </div>
    </div>
  );
};
