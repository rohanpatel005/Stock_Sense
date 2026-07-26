import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const MarketPreview = () => {
  const tickerItems = [
    { name: 'NIFTY 50', value: '22,514.65', change: '0.84%', isUp: true },
    { name: 'BANK NIFTY', value: '48,201.10', change: '1.12%', isUp: true },
    { name: 'SENSEX', value: '74,119.39', change: '0.15%', isUp: false },
    { name: 'RELIANCE', value: '2,984.50', change: '2.4%', isUp: true },
    { name: 'HDFC BANK', value: '1,524.00', change: '0.4%', isUp: false },
  ];

  return (
    <div id="market" className="w-full bg-surface-container py-4 border-y border-outline-variant/10 overflow-hidden relative z-30">
      <div className="flex marquee whitespace-nowrap">
        {/* Render twice for infinite marquee scrolling */}
        {[1, 2].map((loopIndex) => (
          <div key={loopIndex} className="flex items-center gap-12 px-6">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-label-caps font-bold text-on-background">{item.name}</span>
                <span
                  className={`text-body-md font-data-mono font-bold ${
                    item.isUp ? 'text-primary' : 'text-error'
                  }`}
                >
                  {item.value}
                </span>
                <span
                  className={`text-body-sm flex items-center font-bold ${
                    item.isUp ? 'text-primary' : 'text-error'
                  }`}
                >
                  {item.isUp ? (
                    <ArrowUp className="w-4 h-4 mr-0.5" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-0.5" />
                  )}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPreview;
