import { Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

export const getStatusBadge = (status) => {
  switch(status) {
    case 'SUCCESS': return <span className="bg-[#00E0A4]/10 text-[#00E0A4] border border-[#00E0A4]/30 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(0,224,164,0.1)]"><CheckCircle className="w-3 h-3"/> {status}</span>;
    case 'FAILED': return <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.1)]"><AlertCircle className="w-3 h-3"/> {status}</span>;
    case 'PENDING': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.1)]"><Clock className="w-3 h-3"/> {status}</span>;
    default: return <span className="bg-white/10 text-slate-300 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{status}</span>;
  }
};

const OrdersTable = ({ orders, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-sm p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] py-20 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#00E0A4]/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,224,164,0.1)]">
          <Info className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-black text-white">No Orders Found</h3>
        <p className="text-slate-400 font-semibold mt-2 max-w-sm">
          You haven't placed any orders that match these filters. Start paper trading to see your order history.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] overflow-hidden relative"
    >
      {/* Very soft purple glow */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0A0D14]/80 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-4 px-6 font-bold whitespace-nowrap">Time</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Stock</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Action</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Qty</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Price</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Total</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order, i) => {
              const isBuy = order.transaction_type === 'BUY';
              
              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={order.id} 
                  onClick={() => onRowClick(order)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{dayjs(order.created_at).format('DD MMM YYYY')}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{dayjs(order.created_at).format('hh:mm A')}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-black text-white group-hover:text-[#00E0A4] transition-colors">{order.stock_symbol}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5 truncate max-w-[120px]" title={order.company_name}>{order.company_name}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${isBuy ? 'bg-[#00E0A4]/10 text-[#00E0A4] border-[#00E0A4]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                      {order.transaction_type}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {order.order_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-300">
                    {order.quantity}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-300">
                    ₹{parseFloat(order.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap font-black text-white group-hover:text-[#00E0A4] transition-colors">
                    ₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {getStatusBadge(order.order_status)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default OrdersTable;
