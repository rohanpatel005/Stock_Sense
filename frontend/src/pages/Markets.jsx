import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Search, X, ChevronUp, ChevronDown,
  ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, Activity,
  Layers, Clock, HelpCircle, Star, Eye, Zap, Flame, Award, ShieldAlert
} from 'lucide-react';
import Sidebar from '../components/Common/Sidebar';

const API_BASE = 'http://127.0.0.1:8000/api/market';
const REFRESH_INTERVAL_MS = 15000; // 15s refresh for live market data

// ─── SVG Sparkline Chart ──────────────────────────────────────────────────────
const SparkLine = ({ data = [], color = '#10B981', height = 36 }) => {
  if (!data || data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 160, H = height;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) + 2}`
  ).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-28 sm:w-36" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
};

// ─── SVG Detailed Drawer Chart ────────────────────────────────────────────────
const PriceChart = ({ closes = [], timestamps = [], isUp = true }) => {
  const [tooltip, setTooltip] = useState(null);
  if (!closes || !closes.length) return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
      No chart data available
    </div>
  );

  const W = 600, H = 200, PAD = { t: 15, b: 25, l: 15, r: 15 };
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const toX = (i) => PAD.l + (i / (closes.length - 1)) * innerW;
  const toY = (v) => PAD.t + innerH - ((v - min) / range) * innerH;

  const pts = closes.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const fillPts = `${PAD.l},${PAD.t + innerH} ${pts} ${toX(closes.length - 1)},${PAD.t + innerH}`;
  const strokeColor = isUp ? '#10B981' : '#EF4444';
  const fillId = `drawerChartFill_${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="relative w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-48 overflow-visible"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${fillId})`} points={fillPts} />
        <polyline fill="none" stroke={strokeColor} strokeWidth="2" points={pts} />
        {closes.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(v)} r="5"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setTooltip({ i, v, x: toX(i), y: toY(v) })}
          />
        ))}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={PAD.t + innerH}
              stroke="#475569" strokeWidth="1" strokeDasharray="3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="5" fill={strokeColor} />
          </>
        )}
      </svg>
      {tooltip && (
        <div
          className="absolute bg-slate-800 text-white text-xs px-2 py-1 rounded-lg pointer-events-none shadow-xl border border-slate-700"
          style={{ left: (tooltip.x / W * 100) + '%', top: '10px', transform: 'translateX(-50%)' }}
        >
          <div className="font-bold">₹{tooltip.v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          {timestamps[tooltip.i] && <span className="block text-[10px] text-slate-400">{timestamps[tooltip.i]}</span>}
        </div>
      )}
    </div>
  );
};

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const SkeletonLoader = ({ count = 3, height = 'h-12' }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`bg-slate-100 animate-pulse rounded-xl w-full ${height}`} />
    ))}
  </div>
);

// ─── Cache Store for SWR ──────────────────────────────────────────────────────
let cachedMarketData = {};

const Markets = () => {
  const navigate = useNavigate();
  const { symbol } = useParams();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [overview, setOverview] = useState(cachedMarketData.overview || []);
  const [gainers, setGainers] = useState(cachedMarketData.gainers || []);
  const [losers, setLosers] = useState(cachedMarketData.losers || []);
  const [mostActive, setMostActive] = useState(cachedMarketData.mostActive || []);
  const [sectors, setSectors] = useState(cachedMarketData.sectors || []);
  const [breadth, setBreadth] = useState(cachedMarketData.breadth || null);
  const [status, setStatus] = useState(cachedMarketData.status || null);
  
  // UI Controls
  const [loading, setLoading] = useState({
    overview: !cachedMarketData.overview,
    movers: !cachedMarketData.gainers,
    sectors: !cachedMarketData.sectors,
    breadth: !cachedMarketData.breadth,
    status: !cachedMarketData.status
  });
  const [errors, setErrors] = useState({});
  const [activeMoverTab, setActiveMoverTab] = useState('gainers');
  const [selectedSector, setSelectedSector] = useState(null);

  // Search State
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch {
      return [];
    }
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Drawer Detail State
  const [drawerDetail, setDrawerDetail] = useState(null);
  const [drawerHistory, setDrawerHistory] = useState(null);
  const [drawerPeriod, setDrawerPeriod] = useState('1mo');
  const [drawerLoading, setDrawerLoading] = useState(false);

  // User details
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { full_name: 'StockSense User' };
    } catch (e) {
      return { full_name: 'StockSense User' };
    }
  });

  // ─── API Client ─────────────────────────────────────────────────────────────
  const fetchAPI = useCallback(async (endpoint) => {
    const token = localStorage.getItem('access_token');
    const resp = await axios.get(`${API_BASE}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return resp.data;
  }, []);

  // ─── Data Loaders ────────────────────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, overview: null }));
      const data = await fetchAPI('overview');
      setOverview(data);
      cachedMarketData.overview = data;
    } catch (err) {
      setErrors(prev => ({ ...prev, overview: 'Failed to load indexes' }));
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  }, [fetchAPI]);

  const loadMovers = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, movers: null }));
      const [g, l, ma] = await Promise.all([
        fetchAPI('gainers'),
        fetchAPI('losers'),
        fetchAPI('most-active')
      ]);
      setGainers(g);
      setLosers(l);
      setMostActive(ma);
      cachedMarketData.gainers = g;
      cachedMarketData.losers = l;
      cachedMarketData.mostActive = ma;
    } catch (err) {
      setErrors(prev => ({ ...prev, movers: 'Failed to load market movers' }));
    } finally {
      setLoading(prev => ({ ...prev, movers: false }));
    }
  }, [fetchAPI]);

  const loadSectors = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, sectors: null }));
      const data = await fetchAPI('sectors');
      setSectors(data);
      cachedMarketData.sectors = data;
    } catch (err) {
      setErrors(prev => ({ ...prev, sectors: 'Failed to load sector metrics' }));
    } finally {
      setLoading(prev => ({ ...prev, sectors: false }));
    }
  }, [fetchAPI]);

  const loadBreadth = useCallback(async () => {
    try {
      setErrors(prev => ({ ...prev, breadth: null }));
      const data = await fetchAPI('breadth');
      setBreadth(data);
      cachedMarketData.breadth = data;
    } catch (err) {
      setErrors(prev => ({ ...prev, breadth: 'Failed to load breadth' }));
    } finally {
      setLoading(prev => ({ ...prev, breadth: false }));
    }
  }, [fetchAPI]);

  const loadStatus = useCallback(async () => {
    try {
      const data = await fetchAPI('market-status');
      setStatus(data);
      cachedMarketData.status = data;
    } catch {
      setStatus({ status: 'CLOSED', label: 'Market Closed', last_updated: new Date().toLocaleString() });
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  }, [fetchAPI]);

  // Load everything on start
  useEffect(() => {
    loadOverview();
    loadMovers();
    loadSectors();
    loadBreadth();
    loadStatus();

    // Set polling
    const timer = setInterval(() => {
      loadOverview();
      loadMovers();
      loadBreadth();
      loadStatus();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [loadOverview, loadMovers, loadSectors, loadBreadth, loadStatus]);

  // ─── Search Functionality ───────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!searchQ.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await fetchAPI(`search?q=${encodeURIComponent(searchQ)}`);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQ, fetchAPI]);

  const selectStock = useCallback((sym) => {
    // Add to recent searches
    const updated = [sym, ...recentSearches.filter(s => s !== sym)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    setSearchQ('');
    setSearchFocused(false);
    navigate(`/share/${sym}`);
  }, [recentSearches, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (searchIndex >= 0 && searchResults[searchIndex]) {
        selectStock(searchResults[searchIndex].symbol);
      } else if (searchResults.length > 0) {
        selectStock(searchResults[0].symbol);
      }
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
    }
  };

  // ─── Detail Drawer Fetcher ──────────────────────────────────────────────────
  const loadDrawerData = useCallback(async (sym) => {
    setDrawerLoading(true);
    try {
      const [detail, history] = await Promise.all([
        fetchAPI(`stock/${sym}`),
        fetchAPI(`stock/${sym}/history?period=${drawerPeriod}`)
      ]);
      setDrawerDetail(detail);
      setDrawerHistory(history);
    } catch (e) {
      console.error('Failed to load drawer data:', e);
      setDrawerDetail({
        symbol: sym, name: sym + ' Ltd', sector: 'Other', price: 0.0, change: 0, change_percent: 0,
        open: 0, high: 0, low: 0, prev_close: 0, high_52w: 0, low_52w: 0, volume: '—', market_cap: '—'
      });
    } finally {
      setDrawerLoading(false);
    }
  }, [fetchAPI, drawerPeriod]);

  useEffect(() => {
    if (symbol) {
      navigate(`/share/${symbol}`, { replace: true });
    }
  }, [symbol, navigate]);

  // ─── Render Helper ──────────────────────────────────────────────────────────
  const activeMoversList = activeMoverTab === 'gainers' ? gainers
    : activeMoverTab === 'losers' ? losers
    : mostActive;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar navigation */}
      <Sidebar activePage="market" user={user} />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Market Research</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Live overview of the Indian stock market</p>
          </div>

          <div className="flex items-center gap-2.5 bg-white shadow-sm border border-slate-100 px-4 py-2.5 rounded-2xl">
            <span className={`w-3 h-3 rounded-full ${status?.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
            <div>
              <div className="text-xs font-bold text-slate-800">{status?.label || 'Loading Status...'}</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{status?.last_updated}</div>
            </div>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="relative z-40 max-w-2xl">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search any NSE listed company..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all font-semibold"
            />
            {searchLoading && (
              <RefreshCw className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            )}
          </div>

          <AnimatePresence>
            {searchFocused && (searchQ.trim() || recentSearches.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
              >
                {!searchQ.trim() && recentSearches.length > 0 && (
                  <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Searches</span>
                  </div>
                )}
                
                {!searchQ.trim() && recentSearches.map((sym, idx) => (
                  <button
                    key={sym}
                    onClick={() => selectStock(sym)}
                    className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-800">{sym}</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}

                {searchResults.map((item, idx) => (
                  <button
                    key={item.symbol}
                    onClick={() => selectStock(item.symbol)}
                    className={`w-full text-left px-5 py-3 transition-colors flex justify-between items-center ${
                      idx === searchIndex ? 'bg-[#0F766E]/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{item.symbol}</span>
                      <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}

                {searchQ.trim() && searchResults.length === 0 && !searchLoading && (
                  <div className="p-5 text-center text-slate-400 text-sm">
                    No companies found matching "{searchQ}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MARKET OVERVIEW */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Market Overview</h2>
          </div>

          {loading.overview ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <SkeletonLoader count={5} height="h-28" />
            </div>
          ) : errors.overview ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> {errors.overview}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {overview.map((idx) => {
                const isPositive = idx.change >= 0;
                return (
                  <motion.div
                    key={idx.name}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{idx.name}</div>
                      <div className="text-xl font-black text-slate-950 mt-1">{idx.value.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className={`flex items-center text-xs font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                        {isPositive ? '+' : ''}{idx.change_percent.toFixed(2)}%
                      </div>
                      <SparkLine data={idx.sparkline} color={isPositive ? '#10B981' : '#EF4444'} height={24} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* MARKET MOVERS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Market Movers</h2>
            </div>
            
            {/* TABS */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl self-start">
              {['gainers', 'losers', 'mostActive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMoverTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeMoverTab === tab ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'gainers' ? 'Top Gainers' : tab === 'losers' ? 'Top Losers' : 'Most Active'}
                </button>
              ))}
            </div>
          </div>

          {loading.movers ? (
            <SkeletonLoader count={5} height="h-14" />
          ) : errors.movers ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> {errors.movers}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Sector</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Current Price</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Today's Change</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMoversList.map((stock) => {
                    const isPositive = stock.change_percent >= 0;
                    return (
                      <tr
                        key={stock.symbol}
                        onClick={() => selectStock(stock.symbol)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">{stock.symbol}</div>
                          <div className="text-xs text-slate-400 font-medium">{stock.name}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 font-bold">{stock.sector}</td>
                        <td className="px-5 py-3.5 text-right font-black text-slate-950">₹{stock.price.toFixed(2)}</td>
                        <td className={`px-5 py-3.5 text-right font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                          <span className="block">{isPositive ? '+' : ''}{stock.change.toFixed(2)}</span>
                          <span className="text-[10px] font-semibold">{isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%</span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-slate-500 font-semibold">{(stock.volume/1e5).toFixed(1)} Lakhs</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SECTOR PERFORMANCE (Full Width Grid: 5 Columns) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Sector Performance</h2>
          </div>

          {loading.sectors ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <SkeletonLoader count={15} height="h-20" />
            </div>
          ) : errors.sectors ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> {errors.sectors}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {sectors.map((sec) => {
                const isUp = sec.change_percent >= 0;
                return (
                  <motion.div
                    key={sec.name}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUp ? 'bg-emerald-50/20 border-emerald-100' : 'bg-red-50/10 border-red-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-extrabold text-slate-800 text-xs sm:text-sm truncate max-w-[100px]">{sec.name}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{sec.trend}</div>
                      </div>
                      <div className={`flex items-center text-xs font-black ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                        {isUp ? '+' : ''}{sec.change_percent}%
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end items-center">
                      <SparkLine data={sec.sparkline} color={isUp ? '#10B981' : '#EF4444'} height={18} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* SIDE-BY-SIDE GRID: BREADTH & QUICK INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MARKET BREADTH */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Market Breadth</h2>
            </div>

            {loading.breadth ? (
              <SkeletonLoader count={1} height="h-64" />
            ) : errors.breadth ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> {errors.breadth}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-600 block">{breadth?.advances}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Advances</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <span className="text-2xl font-black text-slate-500 block">{breadth?.unchanged}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unchanged</span>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                    <span className="text-2xl font-black text-red-500 block">{breadth?.declines}</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Declines</span>
                  </div>
                </div>

                {/* Progress Bar visual indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>AD Ratio: {breadth?.ad_ratio}</span>
                    <span>Total Traded: {breadth?.total_volume}</span>
                  </div>
                  
                  {/* advances vs declines ratio bar */}
                  <div className="h-3.5 bg-red-400 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(breadth?.advances / (breadth?.advances + breadth?.declines || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">Total Volume</span>
                    <span className="font-bold text-slate-800 text-sm">{breadth?.total_volume}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">Total Turnover</span>
                    <span className="font-bold text-slate-800 text-sm">{breadth?.total_value}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* QUICK INSIGHTS SECTION */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#0F766E]" />
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Quick Market Insights</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => gainers.length && selectStock(gainers[0].symbol)}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider truncate">Gainer Today</span>
                  <span className="font-extrabold text-slate-800 block text-xs sm:text-sm group-hover:text-[#0F766E] transition-colors truncate">{gainers[0]?.symbol || '—'}</span>
                </div>
                <Flame className="w-4 h-4 text-amber-500 flex-shrink-0 ml-1" />
              </div>

              <div
                onClick={() => losers.length && selectStock(losers[0].symbol)}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider truncate">Loser Today</span>
                  <span className="font-extrabold text-slate-800 block text-xs sm:text-sm group-hover:text-red-500 transition-colors truncate">{losers[0]?.symbol || '—'}</span>
                </div>
                <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
              </div>

              <div
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider truncate">Strong Sector</span>
                  <span className="font-extrabold text-slate-800 block text-xs sm:text-sm truncate">{sectors[0]?.name || '—'}</span>
                </div>
                <Award className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-1" />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* SECTOR STOCKS LIST DRAWER/MODAL */}
      <AnimatePresence>
        {selectedSector && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
            {/* Backdrop close */}
            <div className="absolute inset-0" onClick={() => setSelectedSector(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedSector.name} Sector</h3>
                  <span className={`text-sm font-bold block mt-1 ${selectedSector.change_percent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedSector.change_percent >= 0 ? '+' : ''}{selectedSector.change_percent}% Today
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSector(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3 flex-1">
                {selectedSector.stocks?.map((stk) => (
                  <div
                    key={stk.symbol}
                    onClick={() => {
                      setSelectedSector(null);
                      selectStock(stk.symbol);
                    }}
                    className="p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 block group-hover:text-[#0F766E] transition-colors">{stk.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{stk.name}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0F766E] transition-colors" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STOCK RESEARCH DETAIL DRAWER */}
      <AnimatePresence>
        {symbol && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
            <div className="absolute inset-0" onClick={() => navigate('/market')} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">{drawerDetail?.symbol || symbol}</h3>
                  <span className="text-xs text-slate-400 font-semibold block mt-0.5">{drawerDetail?.name}</span>
                </div>
                <button
                  onClick={() => navigate('/market')}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {drawerLoading ? (
                <div className="p-8">
                  <SkeletonLoader count={4} height="h-20" />
                </div>
              ) : (
                <div className="mt-5 space-y-6">
                  {/* Stock Price Header */}
                  <div className="flex justify-between items-center bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Live Price</span>
                      <span className="text-3xl font-black text-slate-950">₹{drawerDetail?.price?.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Today</span>
                      <span className={`text-base font-bold flex items-center justify-end ${drawerDetail?.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {drawerDetail?.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                        {drawerDetail?.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Period Switch & Chart */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Chart</span>
                      
                      <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        {['1d', '5d', '1mo', '1y'].map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setDrawerPeriod(p);
                              // Refresh history for this period
                              fetchAPI(`stock/${symbol}/history?period=${p}`).then(setDrawerHistory);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              drawerPeriod === p ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <PriceChart
                      closes={drawerHistory?.closes}
                      timestamps={drawerHistory?.timestamps}
                      isUp={(drawerDetail?.change || 0) >= 0}
                    />
                  </div>

                  {/* Stock Metrics Grid */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Statistics</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Open</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.open?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Prev Close</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.prev_close?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Day High</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.high?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Day Low</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.low?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">52 Week High</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.high_52w?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">52 Week Low</span>
                        <span className="font-bold text-slate-800 text-sm">₹{drawerDetail?.low_52w?.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Volume</span>
                        <span className="font-bold text-slate-800 text-sm">{drawerDetail?.volume}</span>
                      </div>
                      <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Market Cap</span>
                        <span className="font-bold text-slate-800 text-sm">{drawerDetail?.market_cap}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Markets;
