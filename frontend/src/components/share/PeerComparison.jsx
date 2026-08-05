import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const PeerComparison = ({ data }) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card overflow-hidden hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Peer Comparison</h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">Company</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">PE Ratio</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">ROE</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">ROCE</th>
              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right group-hover:text-slate-300 transition-colors">Market Cap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((peer, idx) => (
              <tr 
                key={idx} 
                onClick={() => navigate(`/share/${peer.symbol}`)}
                className="hover:bg-white/5 cursor-pointer transition-colors group/row"
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-sm text-white group-hover/row:text-[#00E0A4] transition-colors block">{peer.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{peer.name}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">{peer.pe}</td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">{peer.roe}%</td>
                <td className="px-6 py-4 text-sm text-slate-300 font-semibold text-right">{peer.roce}%</td>
                <td className="px-6 py-4 text-sm text-white font-bold text-right">{peer.market_cap}</td>
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
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] shadow-lg premium-glass-card hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Related Peers</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((sym) => (
          <div
            key={sym}
            onClick={() => navigate(`/share/${sym}`)}
            className="p-4 border border-white/10 rounded-[16px] bg-white/5 hover:border-[#00E0A4]/30 hover:bg-white/10 transition-all cursor-pointer flex justify-between items-center group/item hover-lift-card"
          >
            <div>
              <span className="font-extrabold text-sm text-white group-hover/item:text-[#00E0A4] transition-colors block">{sym}</span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5 group-hover/item:text-slate-300">NSE Listed</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/item:text-[#00E0A4] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};
