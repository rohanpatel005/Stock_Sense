import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const PeerComparison = ({ data }) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Peer Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">PE Ratio</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">ROE</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">ROCE</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((peer, idx) => (
              <tr 
                key={idx} 
                onClick={() => navigate(`/share/${peer.symbol}`)}
                className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-sm text-slate-800 group-hover:text-[#0F766E] block">{peer.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{peer.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">{peer.pe}</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">{peer.roe}%</td>
                <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-right">{peer.roce}%</td>
                <td className="px-6 py-4 text-sm text-slate-800 font-bold text-right">{peer.market_cap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RelatedStocks = ({ data }) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Related Peers</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((sym) => (
          <div
            key={sym}
            onClick={() => navigate(`/share/${sym}`)}
            className="p-4 border border-slate-100 rounded-2xl bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center group"
          >
            <div>
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-[#0F766E] transition-colors block">{sym}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">NSE Listed</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};
