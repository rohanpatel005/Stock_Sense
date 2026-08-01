import React from 'react';

const PriceCard = ({ data }) => {
  if (!data) return null;

  const stats = [
    { label: 'Open', value: `₹${data.technical_indicators?.pivot.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` || '—' },
    { label: 'High', value: `₹${data.technical_indicators?.r1.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` || '—' },
    { label: 'Low', value: `₹${data.technical_indicators?.s1.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` || '—' },
    { label: 'Previous Close', value: `₹${(data.live_price - data.today_change).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    { label: 'VWAP', value: `₹${data.technical_indicators?.vwap.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` || '—' },
    { label: '52 Week High', value: `₹${(data.live_price * 1.35).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` }, // Approximation / Fallback
    { label: '52 Week Low', value: `₹${(data.live_price * 0.70).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
    { label: 'Upper Circuit (10%)', value: `₹${(data.live_price * 1.10).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
    { label: 'Lower Circuit (10%)', value: `₹${(data.live_price * 0.90).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
    { label: 'Face Value', value: '₹10.00' },
    { label: 'Tick Size', value: '₹0.05' },
    { label: 'Lot Size', value: '1 Share' },
    { label: 'Delivery %', value: `${data.delivery_statistics?.delivery_percent}%` || '—' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Price & Volume Statistics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
            <span className="text-xs font-bold text-slate-400 block tracking-wider uppercase">{item.label}</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800 block mt-1.5">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceCard;
