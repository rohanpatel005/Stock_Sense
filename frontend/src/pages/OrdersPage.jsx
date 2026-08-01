import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Menu, X, ArrowLeft, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import OrderSummaryCards from '../components/orders/OrderSummaryCards';
import OrderFilters from '../components/orders/OrderFilters';
import OrdersTable from '../components/orders/OrdersTable';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';

const OrdersPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      
      // DRF PageNumberPagination doesn't always return total_pages by default unless customized,
      // but it does return `count` (total items). Assuming 20 per page:
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
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">
      <Sidebar activePage="orders" user={user} />

      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#0F766E]">StockSense</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto p-4 flex flex-col">
           {/* Add standard mobile menu items if needed, mostly handled by routing */}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-6 pb-24 px-4 lg:px-8 space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Book</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track all your transactions.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

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
          <div className="flex items-center justify-between px-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-sm font-semibold text-slate-500">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Order Details Drawer */}
        <OrderDetailsDrawer 
          order={selectedOrder} 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          userEmail={user.email}
        />

      </main>
    </div>
  );
};

export default OrdersPage;
