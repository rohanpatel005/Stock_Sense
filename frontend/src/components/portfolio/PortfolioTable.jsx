import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioTable = ({ holdings, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-sm p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>
        ))}
      </div>
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
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#0A0D14]/80 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-4 px-6 font-bold whitespace-nowrap">Stock</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Qty & Avg Price</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Invested Value</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Current Value (LTP)</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Overall P&L</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Day Chg %</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.map((h, i) => {
              const isProfit = parseFloat(h.profit_loss) >= 0;
              const isDayUp = parseFloat(h.day_change_percentage) >= 0;

              return (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={h.id} 
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Stock Info */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-black text-white group-hover:text-[#00E0A4] transition-colors">{h.stock_symbol}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5 truncate max-w-[150px]" title={h.company_name}>{h.company_name}</div>
                  </td>
                  
                  {/* Qty & Avg Price */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="text-sm font-bold text-white">{h.quantity}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">Avg: ₹{parseFloat(h.average_buy_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </td>
                  
                  {/* Invested Value */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-300">
                    ₹{parseFloat(h.invested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  
                  {/* Current Value & LTP */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="text-sm font-black text-white">₹{parseFloat(h.current_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">LTP: ₹{parseFloat(h.current_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </td>
                  
                  {/* Profit & Loss */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className={`text-sm font-black flex items-center justify-end gap-1 ${isProfit ? 'text-[#00E0A4] drop-shadow-[0_0_8px_rgba(0,224,164,0.3)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfit ? '+' : ''}₹{parseFloat(h.profit_loss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex justify-end mt-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${isProfit ? 'bg-[#00E0A4]/10 border-[#00E0A4]/30 text-[#00E0A4]' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {isProfit ? '+' : ''}{parseFloat(h.profit_loss_percentage).toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  {/* Day Change */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex justify-end">
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold border ${isDayUp ? 'bg-[#00E0A4]/10 border-[#00E0A4]/30 text-[#00E0A4] shadow-[0_0_10px_rgba(0,224,164,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}>
                        {isDayUp ? '+' : ''}{parseFloat(h.day_change_percentage).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/share/${encodeURIComponent(h.stock_symbol)}`)}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:text-[#00E0A4] hover:border-[#00E0A4]/50 hover:bg-[#00E0A4]/10 rounded-lg text-xs font-bold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(0,224,164,0.2)] hover:-translate-y-0.5 flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
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

export default PortfolioTable;
