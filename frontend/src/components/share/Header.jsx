import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Star } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

const Header = ({ data, onBuyClick, onSellClick }) => {
  const { watchlist, toggleWatchlist } = useWatchlist();
  
  if (!data) return null;

  const isPositive = data.today_change_percent >= 0;
  const isMarketOpen = data.market_status === 'OPEN';

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] premium-glass-card hover-lift-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">{data.company_name}</h1>
          <span className="bg-white/5 border border-white/10 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md">
            {data.exchange}
          </span>
          <span className="bg-gradient-to-r from-[#00E0A4]/20 to-[#00E0A4]/5 border border-[#00E0A4]/30 text-[#00E0A4] text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-[0_0_10px_rgba(0,224,164,0.15)]">
            {data.cap_category}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-400 font-semibold">
          <span className="text-slate-300">{data.symbol}</span>
          <span>•</span>
          <span>{data.sector}</span>
          <span>•</span>
          <span>{data.industry}</span>
        </div>
      </div>

      {/* Trading Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 order-2 md:order-none">
        <button 
          onClick={() => toggleWatchlist(data.symbol)}
          className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-slate-400 rounded-full transition-all group"
          title={watchlist.includes(data.symbol) ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Star className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${watchlist.includes(data.symbol) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-slate-400 group-hover:text-white'}`} />
        </button>
        <button 
          onClick={onBuyClick}
          className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-[#00E0A4] to-[#00B37E] hover:from-[#00E0A4] hover:to-[#00E0A4] text-[#05070D] font-bold rounded-[14px] shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          Buy
        </button>
        <button 
          onClick={onSellClick}
          className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold rounded-[14px] shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all transform hover:-translate-y-0.5 active:scale-95 text-sm"
        >
          Sell
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-4 md:pt-0 order-3 md:order-none">
        {/* Price info */}
        <div className="text-left md:text-right relative">
          <div className="text-3xl font-black text-white">₹{data.live_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className={`flex items-center gap-1 mt-1 font-bold text-sm justify-start md:justify-end ${isPositive ? 'text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}{data.today_change.toFixed(2)} ({isPositive ? '+' : ''}{data.today_change_percent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 bg-[#0B1118]/90 border border-white/10 px-4 py-3 rounded-[16px] shadow-lg backdrop-blur-xl">
          <div className={`w-3.5 h-3.5 rounded-full ${isMarketOpen ? 'bg-[#00E0A4] shadow-[0_0_10px_rgba(0,224,164,0.8)] animate-pulse' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'}`} />
          <div>
            <div className={`text-xs font-bold ${isMarketOpen ? 'text-[#00E0A4]' : 'text-slate-300'}`}>
              {isMarketOpen ? 'Market Open' : 'Market Closed'}
            </div>
            <div className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
              Refreshed: {data.last_updated}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
