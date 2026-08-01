import React from 'react';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const OrderSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Orders',
      value: summary.total_orders,
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Successful Orders',
      value: summary.successful_orders,
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Pending Orders',
      value: summary.pending_orders,
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Failed Orders',
      value: summary.failed_orders,
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
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
              <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderSummaryCards;
