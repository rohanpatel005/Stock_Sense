import React from 'react';
import { Calendar, Award } from 'lucide-react';

export const CompanyProfile = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-4 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Company Profile</h3>
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold mb-6">
        {data.description}
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">CEO</span>
          <span className="font-extrabold text-white text-sm">{data.ceo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">Employees</span>
          <span className="font-extrabold text-white text-sm">{data.employees.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">Headquarters</span>
          <span className="font-extrabold text-white text-sm">{data.headquarters}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover:text-slate-300 transition-colors">Market Cap</span>
          <span className="font-extrabold text-white text-sm">₹{(data.market_cap / 1e7).toFixed(1)} Cr</span>
        </div>
      </div>
    </div>
  );
};

export const Ownership = ({ data }) => {
  if (!data) return null;

  // Custom SVG donut chart calculations
  const { promoters, fii, dii, public: pub } = data;
  const total = promoters + fii + dii + pub;
  
  // Convert percentage to cumulative stroke arrays
  const p1 = (promoters / total) * 100;
  const p2 = (fii / total) * 100;
  const p3 = (dii / total) * 100;
  const p4 = (pub / total) * 100;

  const strokeDash1 = `${p1} ${100 - p1}`;
  const strokeDash2 = `${p2} ${100 - p2}`;
  const strokeDash3 = `${p3} ${100 - p3}`;
  const strokeDash4 = `${p4} ${100 - p4}`;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card flex flex-col sm:flex-row items-center gap-6 hover-lift-card group transition-all duration-300">
      <div className="relative w-32 h-32 flex-shrink-0 drop-shadow-md">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          
          {/* Promoters */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#00E0A4" strokeWidth="3.5" 
            strokeDasharray={strokeDash1} strokeDashoffset="0" className="drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
          {/* FII */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3.5" 
            strokeDasharray={strokeDash2} strokeDashoffset={-p1} />
          {/* DII */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="3.5" 
            strokeDasharray={strokeDash3} strokeDashoffset={-(p1 + p2)} />
          {/* Public */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#94a3b8" strokeWidth="3.5" 
            strokeDasharray={strokeDash4} strokeDashoffset={-(p1 + p2 + p3)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none group-hover:text-slate-300 transition-colors">Sharehold.</span>
          <span className="text-sm font-extrabold text-white mt-1">Pattern</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow w-full">
        <div className="flex items-center gap-2 group/item">
          <span className="w-3 h-3 rounded-full bg-[#00E0A4] flex-shrink-0 shadow-[0_0_5px_rgba(0,224,164,0.8)]"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover/item:text-slate-300 transition-colors">Promoters</span>
            <span className="font-extrabold text-white text-sm">{promoters}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 group/item">
          <span className="w-3 h-3 rounded-full bg-[#10B981] flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover/item:text-slate-300 transition-colors">FII</span>
            <span className="font-extrabold text-white text-sm">{fii}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 group/item">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover/item:text-slate-300 transition-colors">DII</span>
            <span className="font-extrabold text-white text-sm">{dii}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 group/item">
          <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider group-hover/item:text-slate-300 transition-colors">Public</span>
            <span className="font-extrabold text-white text-sm">{pub}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PerformanceCards = ({ data }) => {
  if (!data) return null;

  const returns = [
    { label: 'Today', value: data.today },
    { label: '1 Week', value: data.weekly },
    { label: '1 Month', value: data.monthly },
    { label: '3 Month', value: data.three_month },
    { label: '6 Month', value: data.six_month },
    { label: 'YTD', value: data.ytd },
    { label: '1 Year', value: data.one_year },
    { label: '3 Year', value: data.three_year },
    { label: '5 Year', value: data.five_year }
  ];

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300">
      <h3 className="text-lg font-bold text-white mb-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Historical Returns</h3>
      <div className="grid grid-cols-3 gap-3">
        {returns.map((item, idx) => {
          const val = typeof item.value === 'number' ? item.value : parseFloat(item.value);
          const isValid = !isNaN(val);
          const isPos = isValid && val >= 0;
          return (
            <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-[16px] text-center group/item hover:border-[#00E0A4]/30 hover:bg-white/10 transition-all hover-lift-card">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block group-hover/item:text-slate-300 transition-colors">{item.label}</span>
              <span className={`text-xs sm:text-sm font-extrabold block mt-1.5 ${!isValid ? 'text-slate-400' : isPos ? 'text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>
                {!isValid ? 'N/A' : `${isPos ? '+' : ''}${val.toFixed(1)}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const News = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300 space-y-5">
      <h3 className="text-lg font-bold text-white mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Company News</h3>
      <div className="space-y-4 divide-y divide-white/5">
        {data.map((item, idx) => (
          <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-1.5`}>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#00E0A4] bg-[#00E0A4]/10 border border-[#00E0A4]/20 px-2 py-0.5 rounded">{item.source}</span>
              <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
            </div>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs sm:text-sm font-bold text-white leading-snug hover:text-[#00E0A4] block transition-colors"
            >
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Events = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300 space-y-5">
      <h3 className="text-lg font-bold text-white mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Upcoming Events</h3>
      <div className="space-y-4">
        {data.map((event, idx) => (
          <div key={idx} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/10 group/item hover:border-[#00E0A4]/30 hover:bg-white/10 transition-all hover-lift-card">
            <div className="w-10 h-10 rounded-xl bg-[#00E0A4]/10 text-[#00E0A4] flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(0,224,164,0.15)] group-hover/item:shadow-[0_0_12px_rgba(0,224,164,0.3)] transition-all">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover/item:text-[#00E0A4] transition-colors">{event.title}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 group-hover/item:text-slate-300 transition-colors">Date: {event.date} • Type: {event.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
