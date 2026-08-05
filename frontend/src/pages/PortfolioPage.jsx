import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { RefreshCw } from 'lucide-react';
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
    <main className="flex-1 pt-20 lg:pt-6 pb-24 px-4 lg:px-8 space-y-6 relative z-10">
        
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Portfolio</h1>
            <p className="text-slate-400 font-medium mt-1">Live tracking of your paper trading investments.</p>
          </div>
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="self-start sm:self-auto px-4 py-2 bg-[#0B1118]/80 backdrop-blur-md border border-white/10 text-white hover:bg-white/5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 hover:border-[#00E0A4]/30 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00E0A4]' : 'text-[#00E0A4]'}`} />
            {refreshing ? 'Syncing Market...' : 'Refresh Live Prices'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-bold border border-red-500/20 backdrop-blur-md">
            {error}
          </div>
        )}

        {!loading && holdings.length === 0 && !error ? (
          <PortfolioEmptyState />
        ) : (
          <div className="space-y-6">
            <PortfolioSummaryCards summary={summary} />
            <PortfolioFilters filters={filters} setFilters={setFilters} />
            <PortfolioTable holdings={filteredAndSortedHoldings} loading={loading} />
          </div>
        )}

      </main>
    );
};

export default PortfolioPage;
