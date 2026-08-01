import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Menu, X, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';
import PortfolioSummaryCards from '../components/portfolio/PortfolioSummaryCards';
import PortfolioFilters from '../components/portfolio/PortfolioFilters';
import PortfolioTable from '../components/portfolio/PortfolioTable';
import PortfolioEmptyState from '../components/portfolio/PortfolioEmptyState';

const PortfolioPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    filterType: 'ALL',
    sort: 'value_desc',
  });

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { full_name: 'StockSense User', email: '' };
    } catch (e) {
      return { full_name: 'StockSense User', email: '' };
    }
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch holdings and summary concurrently
      const [holdingsRes, summaryRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/portfolio/', { headers }),
        axios.get('http://127.0.0.1:8000/api/portfolio/summary/', { headers })
      ]);

      setHoldings(holdingsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError('Failed to fetch portfolio data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering and sorting
  const filteredAndSortedHoldings = useMemo(() => {
    let result = [...holdings];

    // Search filter
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(h => 
        h.stock_symbol.toLowerCase().includes(lowerSearch) || 
        h.company_name.toLowerCase().includes(lowerSearch)
      );
    }

    // Type filter
    if (filters.filterType === 'PROFIT') {
      result = result.filter(h => parseFloat(h.profit_loss) >= 0);
    } else if (filters.filterType === 'LOSS') {
      result = result.filter(h => parseFloat(h.profit_loss) < 0);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'value_desc': return parseFloat(b.current_value) - parseFloat(a.current_value);
        case 'value_asc': return parseFloat(a.current_value) - parseFloat(b.current_value);
        case 'return_desc': return parseFloat(b.profit_loss_percentage) - parseFloat(a.profit_loss_percentage);
        case 'return_asc': return parseFloat(a.profit_loss_percentage) - parseFloat(b.profit_loss_percentage);
        case 'pl_desc': return parseFloat(b.profit_loss) - parseFloat(a.profit_loss);
        case 'pl_asc': return parseFloat(a.profit_loss) - parseFloat(b.profit_loss);
        default: return parseFloat(b.current_value) - parseFloat(a.current_value);
      }
    });

    return result;
  }, [holdings, filters]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">
      <Sidebar activePage="portfolio" user={user} />

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
        
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Portfolio</h1>
            <p className="text-slate-500 font-medium mt-1">Live tracking of your paper trading investments.</p>
          </div>
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0F766E]' : ''}`} />
            {refreshing ? 'Syncing Market...' : 'Refresh Live Prices'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {!loading && holdings.length === 0 && !error ? (
          <PortfolioEmptyState />
        ) : (
          <>
            <PortfolioSummaryCards summary={summary} />
            <PortfolioFilters filters={filters} setFilters={setFilters} />
            <PortfolioTable holdings={filteredAndSortedHoldings} loading={loading} />
          </>
        )}

      </main>
    </div>
  );
};

export default PortfolioPage;
