import React from 'react';

export const QuarterlyResults = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Quarterly Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Quarter</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Revenue</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Net Profit</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">EPS</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Margins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.period}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.revenue ? `₹${(row.revenue / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.net_profit ? `₹${(row.net_profit / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.eps ? `₹${row.eps.toFixed(2)}` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800 font-bold text-right">{row.margin}%</td>
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
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Annual Financial Statements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Year</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Revenue</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Net Profit</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Cash Flow</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Net Worth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.year}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.revenue ? `₹${(row.revenue / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.profit ? `₹${(row.profit / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">
                  {row.cash_flow ? `₹${(row.cash_flow / 10000000).toFixed(1)} Cr` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-800 font-bold text-right">
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
