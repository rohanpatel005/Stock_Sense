import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import OrderSummaryCards from '../components/orders/OrderSummaryCards';
import OrderFilters from '../components/orders/OrderFilters';
import OrdersTable from '../components/orders/OrdersTable';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';

const OrdersPage = () => {
  const [data, setData] = useState({ summary: null, orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    symbol: '',
    page: 1,
  });
  
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { full_name: 'StockSense User', email: '' };
    } catch (e) {
      return { full_name: 'StockSense User', email: '' };
    }
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.symbol) params.append('symbol', filters.symbol);
      if (filters.page) params.append('page', filters.page);

      const response = await axios.get(`http://127.0.0.1:8000/api/orders/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const results = response.data.results || {};
      const fetchedOrders = results.orders || [];
      
      setData({
        summary: results.summary || null,
        orders: fetchedOrders
      });
      
      const totalItems = response.data.count || fetchedOrders.length;
      setTotalPages(Math.max(1, Math.ceil(totalItems / 20)));
      
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <main className="flex-1 pt-20 lg:pt-6 pb-24 px-4 lg:px-8 space-y-6 relative z-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Book</h1>
          <p className="text-slate-400 font-medium mt-1">Manage and track all your transactions.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/20 backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Summary Cards */}
          <OrderSummaryCards summary={data.summary} />

          {/* Filters */}
          <OrderFilters filters={filters} setFilters={setFilters} />

          {/* Orders Table */}
          <OrdersTable 
            orders={data.orders} 
            loading={loading} 
            onRowClick={(order) => setSelectedOrder(order)} 
          />

          {/* Pagination */}
          {!loading && data.orders.length > 0 && (
            <div className="flex items-center justify-between px-4 bg-[#0B1118]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <span className="text-sm font-semibold text-slate-400">
                Page {filters.page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="p-2 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="p-2 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/5"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Drawer */}
        <OrderDetailsDrawer 
          order={selectedOrder} 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          userEmail={user.email}
        />

      </main>
    );
};

export default OrdersPage;
