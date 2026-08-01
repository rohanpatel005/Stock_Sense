import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const Header = ({ data }) => {
  if (!data) return null;

  const isPositive = data.today_change_percent >= 0;
  const isMarketOpen = data.market_status === 'OPEN';

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{data.company_name}</h1>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">
            {data.exchange}
          </span>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
            {data.cap_category}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500 font-semibold">
          <span>{data.symbol}</span>
          <span>•</span>
          <span>{data.sector}</span>
          <span>•</span>
          <span>{data.industry}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
        {/* Price info */}
        <div className="text-left md:text-right">
          <div className="text-3xl font-black text-slate-950">₹{data.live_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className={`flex items-center gap-1 mt-1 font-bold text-sm justify-start md:justify-end ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}{data.today_change.toFixed(2)} ({isPositive ? '+' : ''}{data.today_change_percent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 px-4 py-3 rounded-2xl">
          <div className={`w-3.5 h-3.5 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
          <div>
            <div className="text-xs font-bold text-slate-800">
              {isMarketOpen ? 'Market Open' : 'Market Closed'}
            </div>
            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">
              Refreshed: {data.last_updated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
