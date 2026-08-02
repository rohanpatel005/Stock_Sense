import React from 'react';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';

const trendingTopics = ['Nifty', 'Sensex', 'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'Upcoming IPO'];

const marketStatus = [
  { name: 'Nifty 50', value: '24,834.85', change: '+125.40', isUp: true },
  { name: 'Sensex', value: '81,332.72', change: '+412.10', isUp: true },
  { name: 'USD/INR', value: '83.95', change: '-0.12', isUp: false },
  { name: 'Gold', value: '₹72,450', change: '+150.00', isUp: true },
  { name: 'Crude Oil', value: '₹6,420', change: '-45.00', isUp: false },
];

const mostRead = [
  { title: 'TCS Q3 Results: What to expect from the IT major', time: '4 hours ago' },
  { title: 'Top 5 dividend paying stocks to buy in 2026', time: '12 hours ago' },
  { title: 'Why midcap stocks are rallying this week', time: 'Yesterday' },
  { title: 'RBI maintains status quo on repo rate at 6.5%', time: '2 days ago' },
  { title: 'How to participate in the upcoming OLA IPO', time: '2 days ago' },
];

const NewsSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
          <TrendingUp className="w-5 h-5 text-[#2563EB]" />
          <h3>Trending Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-lg cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              #{topic}
            </span>
          ))}
        </div>
      </div>

      {/* Market Status Widget */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
          <Activity className="w-5 h-5 text-[#22C55E]" />
          <h3>Market Status</h3>
        </div>
        <div className="space-y-3">
          {marketStatus.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-semibold text-slate-700 text-sm">{item.name}</span>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-sm">{item.value}</div>
                <div className={`text-xs font-semibold ${item.isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Read */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
          <BarChart2 className="w-5 h-5 text-[#F59E0B]" />
          <h3>Most Read Articles</h3>
        </div>
        <div className="space-y-4">
          {mostRead.map((article, index) => (
            <div key={index} className="flex gap-3 group cursor-pointer">
              <div className="text-2xl font-bold text-slate-200 group-hover:text-[#2563EB] transition-colors">
                0{index + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors line-clamp-2 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium">{article.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSidebar;
