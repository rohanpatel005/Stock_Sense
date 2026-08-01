import React from 'react';
import { Calendar, Award } from 'lucide-react';

export const CompanyProfile = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Company Profile</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold mb-6">
        {data.description}
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-6">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">CEO</span>
          <span className="font-extrabold text-slate-800 text-sm">{data.ceo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Employees</span>
          <span className="font-extrabold text-slate-800 text-sm">{data.employees.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Headquarters</span>
          <span className="font-extrabold text-slate-800 text-sm">{data.headquarters}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Market Cap</span>
          <span className="font-extrabold text-slate-800 text-sm">₹{(data.market_cap / 1e7).toFixed(1)} Cr</span>
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
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
          
          {/* Promoters */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#0F766E" strokeWidth="3.5" 
            strokeDasharray={strokeDash1} strokeDashoffset="0" />
          {/* FII */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="3.5" 
            strokeDasharray={strokeDash2} strokeDashoffset={-p1} />
          {/* DII */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="3.5" 
            strokeDasharray={strokeDash3} strokeDashoffset={-(p1 + p2)} />
          {/* Public */}
          <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="3.5" 
            strokeDasharray={strokeDash4} strokeDashoffset={-(p1 + p2 + p3)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Sharehold.</span>
          <span className="text-sm font-extrabold text-slate-800 mt-1">Pattern</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow w-full">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#0F766E] flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Promoters</span>
            <span className="font-extrabold text-slate-800 text-sm">{promoters}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#10B981] flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">FII</span>
            <span className="font-extrabold text-slate-800 text-sm">{fii}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6] flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">DII</span>
            <span className="font-extrabold text-slate-800 text-sm">{dii}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-200 flex-shrink-0"></span>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Public</span>
            <span className="font-extrabold text-slate-800 text-sm">{pub}%</span>
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
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Historical Returns</h3>
      <div className="grid grid-cols-3 gap-3">
        {returns.map((item, idx) => {
          const isPos = item.value >= 0;
          return (
            <div key={idx} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
              <span className={`text-xs sm:text-sm font-extrabold block mt-1.5 ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPos ? '+' : ''}{item.value.toFixed(1)}%
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
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Company News</h3>
      <div className="space-y-4 divide-y divide-slate-50">
        {data.map((item, idx) => (
          <div key={idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-1.5`}>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{item.source}</span>
              <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
            </div>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs sm:text-sm font-bold text-slate-800 leading-snug hover:text-emerald-700 block transition-colors"
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
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Upcoming Events</h3>
      <div className="space-y-4">
        {data.map((event, idx) => (
          <div key={idx} className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E]/5 text-[#0F766E] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">{event.title}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Date: {event.date} • Type: {event.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
