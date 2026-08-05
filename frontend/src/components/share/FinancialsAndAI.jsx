import { Sparkles } from 'lucide-react';

export const FinancialHighlights = ({ data }) => {
  if (!data) return null;

  const formatNum = (val) => {
    const num = Number(val);
    return isNaN(num) ? '—' : num.toFixed(2);
  };

  const metrics = [
    { label: 'Revenue', value: data.revenue ? `₹${(Number(data.revenue) / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'Net Profit', value: data.net_profit ? `₹${(Number(data.net_profit) / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'EBITDA', value: data.ebitda ? `₹${(Number(data.ebitda) / 1e7).toFixed(1)} Cr` : '—' },
    { label: 'ROE', value: `${data.roe}%` },
    { label: 'ROCE', value: `${data.roce}%` },
    { label: 'EPS', value: `₹${formatNum(data.eps)}` },
    { label: 'PE Ratio', value: formatNum(data.pe) },
    { label: 'PB Ratio', value: formatNum(data.pb) },
    { label: 'PEG Ratio', value: formatNum(data.peg) },
    { label: 'Debt to Equity', value: formatNum(data.debt_to_equity) },
    { label: 'Current Ratio', value: formatNum(data.current_ratio) },
    { label: 'Operating Margin', value: `${data.operating_margin}%` }
  ];

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Financial Highlights</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => (
          <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl group/item hover:border-[#00E0A4]/30 hover:bg-white/10 transition-all">
            <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase group-hover/item:text-slate-300 transition-colors">{item.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-white block mt-1.5">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AIAnalysis = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-[#0F766E]/20 to-[#0F766E]/5 backdrop-blur-xl border border-[#0F766E]/30 p-6 rounded-[24px] space-y-6 hover-lift-card group shadow-[0_0_15px_rgba(15,118,110,0.15)] transition-all">
      <div className="flex items-center gap-2 text-[#00E0A4] drop-shadow-[0_0_8px_rgba(0,224,164,0.3)]">
        <Sparkles className="w-5 h-5 fill-[#00E0A4]/20" />
        <h3 className="font-bold text-sm tracking-wider uppercase">AI Technical Insights</h3>
      </div>
      
      <div className="space-y-3.5">
        <div className="bg-[#0B1118]/60 p-3.5 rounded-[16px] border border-[#00E0A4]/20 text-xs hover:border-[#00E0A4]/40 transition-colors">
          <strong className="text-[#00E0A4] block mb-1">Estimated Trend & Strength:</strong>
          <span className="text-white font-semibold">{data.strength} {data.trend} Momentum</span>
        </div>
        <div className="bg-[#0B1118]/60 p-3.5 rounded-[16px] border border-[#00E0A4]/20 text-xs hover:border-[#00E0A4]/40 transition-colors">
          <strong className="text-[#00E0A4] block mb-1">Growth & Volatility Risks:</strong>
          <span className="text-white font-semibold">{data.risk} ({data.volatility} Volatility)</span>
        </div>
        <div className="bg-[#0B1118]/60 p-3.5 rounded-[16px] border border-[#00E0A4]/20 text-xs hover:border-[#00E0A4]/40 transition-colors">
          <strong className="text-[#00E0A4] block mb-1">Key Observation:</strong>
          <span className="text-white font-semibold">{data.suggested_observation}</span>
        </div>
      </div>

      <div className="border-t border-[#00E0A4]/20 pt-4 flex justify-between items-baseline">
        <span className="text-xs text-slate-300 font-bold group-hover:text-white transition-colors">Bullish/Bearish Bias Score</span>
        <span className="text-lg font-black text-[#00E0A4] drop-shadow-[0_0_8px_rgba(0,224,164,0.5)]">{data.bullish_score}% Bullish</span>
      </div>
    </div>
  );
};
