import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TICKER_ITEMS = [
  { name: 'NIFTY 50', value: '22,514.65', change: '0.84%', isUp: true },
  { name: 'BANK NIFTY', value: '48,201.10', change: '1.12%', isUp: true },
  { name: 'SENSEX', value: '74,119.39', change: '0.15%', isUp: false },
  { name: 'RELIANCE', value: '2,984.50', change: '2.40%', isUp: true },
  { name: 'HDFC BANK', value: '1,524.00', change: '0.40%', isUp: false },
];

const MarketPreview = ({ items = TICKER_ITEMS }) => {
  return (
    <div
      id="market"
      className="w-full bg-[#080d16] py-3.5 border-y border-white/10 overflow-hidden relative z-30 shadow-inner"
    >
      <div className="flex items-center w-full">
        {/* Live Indicator Badge on Left */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border-r border-white/10 text-emerald-400 text-xs font-semibold tracking-wider shrink-0 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono">LIVE MARKET</span>
        </div>

        {/* Marquee ticker container */}
        <div className="flex marquee whitespace-nowrap overflow-hidden py-0.5">
          {[1, 2].map((loopIndex) => (
            <div key={loopIndex} className="flex items-center gap-8 px-6">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-1.5 hover:border-emerald-500/30 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-300 font-display tracking-tight">
                    {item.name}
                  </span>
                  <span className="text-sm font-mono font-semibold text-white">
                    ₹{item.value}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                      item.isUp
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {item.isUp ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketPreview;
