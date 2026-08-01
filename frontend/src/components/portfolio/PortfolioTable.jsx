import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

const PortfolioTable = ({ holdings, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6 font-bold whitespace-nowrap">Stock</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Qty & Avg Price</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Invested Value</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Current Value (LTP)</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Overall P&L</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-right">Day Chg %</th>
              <th className="py-4 px-6 font-bold whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {holdings.map((h) => {
              const isProfit = parseFloat(h.profit_loss) >= 0;
              const isDayUp = parseFloat(h.day_change_percentage) >= 0;

              return (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Stock Info */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{h.stock_symbol}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5 truncate max-w-[150px]" title={h.company_name}>{h.company_name}</div>
                  </td>
                  
                  {/* Qty & Avg Price */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{h.quantity}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">Avg: ₹{parseFloat(h.average_buy_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </td>
                  
                  {/* Invested Value */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-bold text-slate-700">
                    ₹{parseFloat(h.invested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  
                  {/* Current Value & LTP */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="text-sm font-black text-slate-900">₹{parseFloat(h.current_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">LTP: ₹{parseFloat(h.current_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </td>
                  
                  {/* Profit & Loss */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className={`text-sm font-black flex items-center justify-end gap-1 ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfit ? '+' : ''}₹{parseFloat(h.profit_loss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isProfit ? '+' : ''}{parseFloat(h.profit_loss_percentage).toFixed(2)}%
                    </div>
                  </td>

                  {/* Day Change */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${isDayUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isDayUp ? '+' : ''}{parseFloat(h.day_change_percentage).toFixed(2)}%
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/share/${h.stock_symbol.replace('.NS', '')}`)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 mx-auto"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
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

export default PortfolioTable;
