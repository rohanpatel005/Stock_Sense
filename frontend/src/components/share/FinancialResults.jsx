import React from 'react';

export const QuarterlyResults = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card overflow-hidden hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Quarterly Performance</h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">Quarter</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Revenue</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Net Profit</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">EPS</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Margins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-white">{row.period}</td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.revenue ? `₹${(row.revenue / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.net_profit ? `₹${(row.net_profit / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.eps ? `₹${row.eps.toFixed(2)}` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-white font-bold text-right">{row.margin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AnnualResults = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card overflow-hidden hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Annual Financial Statements</h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">Year</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Revenue</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Net Profit</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Cash Flow</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Net Worth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-white">{row.year}</td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.revenue ? `₹${(row.revenue / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.profit ? `₹${(row.profit / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">
                  {row.cash_flow ? `₹${(row.cash_flow / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-white font-bold text-right">
                  {row.net_worth ? `₹${(row.net_worth / 10000000).toFixed(1)} Cr` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
