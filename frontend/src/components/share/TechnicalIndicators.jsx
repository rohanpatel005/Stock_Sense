import React from 'react';

const TechnicalIndicators = ({ data }) => {
  if (!data) return null;

  const maGroup = [
    { name: 'EMA 20', value: `₹${data.ema_20.toFixed(2)}` },
    { name: 'EMA 50', value: `₹${data.ema_50.toFixed(2)}` },
    { name: 'EMA 100', value: `₹${data.ema_100.toFixed(2)}` },
    { name: 'EMA 200', value: `₹${data.ema_200.toFixed(2)}` },
    { name: 'SMA 20', value: `₹${data.sma_20.toFixed(2)}` },
    { name: 'VWAP', value: `₹${data.vwap.toFixed(2)}` }
  ];

  const oscillators = [
    { name: 'RSI (14)', value: data.rsi.toFixed(2), sentiment: data.rsi < 30 ? 'Oversold' : data.rsi > 70 ? 'Overbought' : 'Neutral' },
    { name: 'MACD Line', value: data.macd_line.toFixed(2) },
    { name: 'MACD Signal', value: data.macd_signal.toFixed(2) },
    { name: 'ADX (14)', value: data.adx.toFixed(2), sentiment: data.adx > 25 ? 'Strong Trend' : 'Weak Trend' },
    { name: 'CCI (20)', value: data.cci.toFixed(2) },
    { name: 'MFI (14)', value: data.mfi.toFixed(2) }
  ];

  const channels = [
    { name: 'BB Upper', value: `₹${data.bb_upper.toFixed(2)}` },
    { name: 'BB Lower', value: `₹${data.bb_lower.toFixed(2)}` },
    { name: 'Donchian Upper', value: `₹${data.donchian_upper.toFixed(2)}` },
    { name: 'Donchian Lower', value: `₹${data.donchian_lower.toFixed(2)}` },
    { name: 'Keltner Upper', value: `₹${data.keltner_upper.toFixed(2)}` },
    { name: 'Keltner Lower', value: `₹${data.keltner_lower.toFixed(2)}` }
  ];

  return (
    <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group">
      <h3 className="text-lg font-bold text-white mb-6 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all">Technical Indicators</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Moving Averages */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2">Moving Averages</h4>
          <div className="divide-y divide-white/5">
            {maGroup.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 group/item">
                <span className="text-xs text-slate-400 font-semibold group-hover/item:text-slate-300 transition-colors">{item.name}</span>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Oscillators */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2">Oscillators</h4>
          <div className="divide-y divide-white/5">
            {oscillators.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 group/item">
                <span className="text-xs text-slate-400 font-semibold group-hover/item:text-slate-300 transition-colors">{item.name}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">{item.value}</span>
                  {item.sentiment && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border mt-0.5 inline-block ${
                      item.sentiment.includes('Over') ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_8px_rgba(251,191,36,0.15)]' : 'text-slate-300 bg-white/5 border-white/10'
                    }`}>{item.sentiment}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channels & Volatility */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2">Volatility & Channels</h4>
          <div className="divide-y divide-white/5">
            {channels.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5 group/item">
                <span className="text-xs text-slate-400 font-semibold group-hover/item:text-slate-300 transition-colors">{item.name}</span>
                <span className="text-sm font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechnicalIndicators;
