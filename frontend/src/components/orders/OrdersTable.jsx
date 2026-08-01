import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import dayjs from 'dayjs';

export const getStatusBadge = (status) => {
  switch(status) {
    case 'SUCCESS': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {status}</span>;
    case 'FAILED': return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {status}</span>;
    case 'PENDING': return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> {status}</span>;
    default: return <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">{status}</span>;
  }
};

const OrdersTable = ({ orders, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-20 px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-slate-800">No Orders Found</h3>
        <p className="text-slate-500 font-semibold mt-2 max-w-sm">
          You haven't placed any orders that match these filters. Start paper trading to see your order history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6 font-bold whitespace-nowrap">Time</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Stock</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Action</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Qty</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Price</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Total</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => {
              const isBuy = order.transaction_type === 'BUY';
              
              return (
                <tr 
                  key={order.id} 
                  onClick={() => onRowClick(order)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{dayjs(order.created_at).format('DD MMM YYYY')}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{dayjs(order.created_at).format('hh:mm A')}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{order.stock_symbol}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate max-w-[120px]" title={order.company_name}>{order.company_name}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {order.transaction_type}
                    </span>
                    <span className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                      {order.order_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-700">
                    {order.quantity}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-700">
                    ₹{parseFloat(order.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-black text-slate-900">
                    ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {getStatusBadge(order.order_status)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
