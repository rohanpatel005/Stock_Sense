import React from 'react';
import { Briefcase, IndianRupee, PieChart, TrendingUp, TrendingDown } from 'lucide-react';

const PortfolioSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const isProfit = summary.overall_profit_loss >= 0;
  
  const cards = [
    {
      title: 'Current Value',
      value: `₹${parseFloat(summary.current_portfolio_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Briefcase,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      title: 'Available Cash',
      value: `₹${parseFloat(summary.available_cash).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: IndianRupee,
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-500',
    },
    {
      title: 'Invested Amount',
      value: `₹${parseFloat(summary.invested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: PieChart,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Overall P&L',
      value: `${isProfit ? '+' : ''}₹${parseFloat(summary.overall_profit_loss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subValue: `${isProfit ? '+' : ''}${parseFloat(summary.total_return_percentage).toFixed(2)}%`,
      icon: isProfit ? TrendingUp : TrendingDown,
      bgColor: isProfit ? 'bg-emerald-50' : 'bg-red-50',
      iconColor: isProfit ? 'text-emerald-500' : 'text-red-500',
      valueColor: isProfit ? 'text-emerald-600' : 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.bgColor}`}>
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-xs tracking-wide uppercase mb-1">{card.title}</p>
              <h3 className={`text-xl xl:text-2xl font-black ${card.valueColor || 'text-slate-900'} truncate max-w-[120px] xl:max-w-[150px]`}>
                {card.value}
              </h3>
              {card.subValue && (
                <p className={`text-xs font-bold mt-1 ${card.valueColor}`}>{card.subValue} All Time</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PortfolioSummaryCards;
