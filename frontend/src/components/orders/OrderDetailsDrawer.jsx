import React from 'react';
import { X, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import dayjs from 'dayjs';
import { getStatusBadge } from './OrdersTable';

const OrderDetailsDrawer = ({ order, isOpen, onClose, userEmail }) => {
  if (!order) return null;

  const isBuy = order.transaction_type === 'BUY';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className={`p-6 flex items-center justify-between border-b border-slate-100 ${isBuy ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Order Details</h2>
              <p className="text-slate-500 text-sm font-semibold">ID: #{order.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900">{order.stock_symbol}</h1>
            <p className="text-slate-500 font-semibold">{order.company_name}</p>
            <div className="flex justify-center mt-4">
              {getStatusBadge(order.order_status)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Transaction Info
            </h3>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-500 font-semibold text-sm">Action</span>
              <span className={`font-black uppercase text-sm ${isBuy ? 'text-emerald-600' : 'text-red-600'}`}>{order.transaction_type}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-500 font-semibold text-sm">Order Type</span>
              <span className="font-bold text-slate-900 text-sm">{order.order_type}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-500 font-semibold text-sm">Quantity</span>
              <span className="font-bold text-slate-900 text-sm">{order.quantity} Shares</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-500 font-semibold text-sm">Executed Price</span>
              <span className="font-bold text-slate-900 text-sm">₹{parseFloat(order.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-sm">Total Amount</span>
              <span className="font-black text-slate-900 text-lg">₹{parseFloat(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
              <span className="text-slate-500 font-semibold text-sm">Placed On</span>
              <span className="font-bold text-slate-900 text-sm">{dayjs(order.created_at).format('DD MMM YYYY, hh:mm A')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold text-sm">Account Email</span>
              <span className="font-bold text-slate-900 text-sm">{userEmail}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default OrderDetailsDrawer;
