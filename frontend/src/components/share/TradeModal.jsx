import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertCircle, CheckCircle, Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const TradeModal = ({ isOpen, onClose, action, symbol, companyName, userWallet, livePrice, onTradeSuccess }) => {
  const [_productType, setProductType] = useState('DELIVERY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderStatus, setOrderStatus] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const isBuy = action === 'BUY';
  const _themeColor = isBuy ? 'emerald' : 'red';
  const themeHex = isBuy ? '#059669' : '#dc2626';

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setOrderType('MARKET');
      setProductType('DELIVERY');
      setLimitPrice(livePrice ? livePrice.toString() : '');
      setError('');
      setSuccess('');
      setOrderStatus(0);
      setShowConfirm(false);
    }
  }, [isOpen, livePrice]);

  if (!isOpen) return null;

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const parsedWallet = parseFloat(userWallet) || 0;
  const currentPriceToUse = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : (livePrice || 0);
  const requiredMargin = quantity * currentPriceToUse;
  const isInsufficientFunds = isBuy && requiredMargin > parsedWallet;

  const handleInitiateTrade = (e) => {
    e.preventDefault();

    if (isInsufficientFunds) {
      setError('Insufficient funds for this transaction.');
      return;
    }

    if (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError('Please enter a valid limit price.');
      return;
    }

    setError('');
    setShowConfirm(true);
  };

  const executeTrade = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setOrderStatus(1); // 1 = Received

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        stock_symbol: symbol,
        company_name: companyName,
        quantity: parseInt(quantity, 10),
        order_type: orderType,
        limit_price: orderType === 'LIMIT' ? parseFloat(limitPrice) : null
      };

      const endpoint = isBuy ? '/api/market/buy/' : '/api/market/sell/';

      // Simulate network delay for "Order Received" step
      await new Promise(resolve => setTimeout(resolve, 800));
      setOrderStatus(2); // 2 = Pending Execution

      const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Simulate network delay before showing success
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOrderStatus(3); // 3 = Success
      setSuccess(response.data.message);
      if (onTradeSuccess) onTradeSuccess();
      setTimeout(onClose, 2000);
    } catch (err) {
      setOrderStatus(0);
      setError(err.response?.data?.error || err.response?.data?.detail || 'An error occurred during the transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 bg-slate-900/60 backdrop-blur-sm sm:items-end">
      {/* Container */}
      <div
        className={`bg-white w-full sm:max-w-[480px] sm:rounded-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 sm:mb-8`}
        style={{ borderTop: `6px solid ${themeHex}` }}
      >

        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${isBuy ? 'bg-emerald-600' : 'bg-red-600'}`}>
                {action}
              </span>
              <h2 className="text-xl font-black text-slate-900">{symbol}</h2>
              <span className="text-xs font-bold text-slate-400">NSE</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <span className="truncate max-w-[200px]">{companyName}</span>
              <span>•</span>
              <span className="text-slate-900 font-bold">₹{livePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 overflow-y-auto">

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-bold shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {orderStatus > 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-8">
              {orderStatus === 3 ? (
                <div className="animate-in zoom-in duration-300 space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Order Successful!</h3>
                  <p className="text-slate-500 font-medium">{success}</p>
                </div>
              ) : (
                <div className="space-y-8 w-full px-4 sm:px-8 animate-in fade-in duration-300">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-[#00E0A4] rounded-full animate-spin mx-auto" />
                  <div className="space-y-5 text-left max-w-[260px] mx-auto">
                    <div className="flex items-center gap-4 transition-all duration-300">
                      <div className={`w-3.5 h-3.5 rounded-full ${orderStatus >= 1 ? 'bg-[#00E0A4] shadow-[0_0_10px_#00E0A4]' : 'bg-slate-200'}`} />
                      <span className={`font-semibold ${orderStatus >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>Order Received by Exchange</span>
                    </div>
                    <div className="flex items-center gap-4 transition-all duration-500">
                      <div className={`w-3.5 h-3.5 rounded-full ${orderStatus >= 2 ? 'bg-[#00E0A4] shadow-[0_0_10px_#00E0A4]' : 'bg-slate-200'}`} />
                      <span className={`font-semibold ${orderStatus >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>Status: Pending Execution...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : !showConfirm ? (
            <form onSubmit={handleInitiateTrade} id="trade-form" className="space-y-6">

              {/* Toggles Group */}
              <div className="space-y-4">
                {/* Order Type Toggle */}
                <div className="flex p-1 bg-slate-100/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOrderType('MARKET')}
                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${orderType === 'MARKET' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Market
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('LIMIT')}
                    className={`flex-1 py-2 font-bold text-sm rounded-lg transition-all ${orderType === 'LIMIT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Inputs Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qty.</label>
                  <div className="flex items-center justify-between border-2 border-slate-200 focus-within:border-slate-400 rounded-xl bg-white overflow-hidden transition-colors">
                    <button type="button" onClick={handleDecrement} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || '')}
                      className="w-full text-center font-bold text-slate-900 focus:outline-none appearance-none"
                    />
                    <button type="button" onClick={handleIncrement} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <div className="border-2 border-slate-200 focus-within:border-slate-400 rounded-xl bg-white overflow-hidden transition-colors flex items-center px-4 py-2.5 h-[48px]">
                    {orderType === 'MARKET' ? (
                      <span className="text-slate-400 font-bold text-sm mx-auto">AT MARKET</span>
                    ) : (
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        required
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        className="w-full text-center font-bold text-slate-900 focus:outline-none appearance-none"
                      />
                    )}
                  </div>
                </div>
              </div>

            </form>
          ) : (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Confirm Order</h3>
                <p className="text-slate-500 font-medium">Please review your order details before execution.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold text-sm">Action</span>
                  <span className={`font-black uppercase ${isBuy ? 'text-emerald-600' : 'text-red-600'}`}>{action}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold text-sm">Quantity</span>
                  <span className="font-bold text-slate-900">{quantity} Shares</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold text-sm">Order Type</span>
                  <span className="font-bold text-slate-900">{orderType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold text-sm">Estimated Total</span>
                  <span className="font-black text-slate-900 text-lg">₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        {!orderStatus && (
          <div className="bg-slate-50 border-t border-slate-100 p-6 space-y-5">
            {/* Margin Info */}
            {!showConfirm && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold">Margin Required</span>
                  <span className="text-slate-900 font-black text-lg">₹{requiredMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-slate-500 font-semibold">Available Funds</span>
                  <span className={`font-black text-lg ${isInsufficientFunds ? 'text-red-500' : 'text-slate-900'}`}>
                    ₹{parsedWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {!showConfirm ? (
                <button
                  type="submit"
                  form="trade-form"
                  disabled={loading}
                  className={`flex-1 py-4 rounded-xl text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${isBuy
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {action} {orderType}
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl text-slate-600 bg-slate-200 hover:bg-slate-300 font-black text-sm uppercase tracking-wide transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeTrade}
                    disabled={loading}
                    className={`flex-1 py-4 rounded-xl text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${isBuy
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TradeModal;
