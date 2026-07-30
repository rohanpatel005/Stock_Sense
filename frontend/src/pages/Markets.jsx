import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Search, X, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Star, BarChart2, Eye, LineChart,
  Menu, LogOut, RefreshCw, Activity, Layers, BookOpen, AlertCircle,
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const API = 'http://127.0.0.1:8000/api';
const POLL_MS = 12000; // 12-second live refresh

// ─── NSE market hours helper ──────────────────────────────────────────────────
const isNSEOpen = () => {
  const now = new Date();
  const ist = (now.getUTCHours() * 60 + now.getUTCMinutes() + 330) % 1440;
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  return ist >= 555 && ist <= 930; // 9:15–15:30
};

// ─── Auth helper ──────────────────────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

// ─── SVG Sparkline Chart ──────────────────────────────────────────────────────
const SparkLine = ({ data = [], color = '#0F766E', height = 40 }) => {
  if (!data.length) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 200, H = height;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) + 2}`
  ).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
};

// ─── Full SVG Price Chart (drawer) ────────────────────────────────────────────
const PriceChart = ({ closes = [], timestamps = [], color = '#0F766E' }) => {
  const [tooltip, setTooltip] = useState(null);
  if (!closes.length) return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
      No chart data available
    </div>
  );

  const W = 800, H = 180, PAD = { t: 10, b: 24, l: 10, r: 10 };
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const toX = (i) => PAD.l + (i / (closes.length - 1)) * innerW;
  const toY = (v) => PAD.t + innerH - ((v - min) / range) * innerH;

  const pts = closes.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const fillPts = `${PAD.l},${PAD.t + innerH} ${pts} ${toX(closes.length - 1)},${PAD.t + innerH}`;

  const isUp = closes[closes.length - 1] >= closes[0];
  const strokeColor = isUp ? '#059669' : '#ef4444';
  const fillId = `chartFill_${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 180 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${fillId})`} points={fillPts} />
        <polyline fill="none" stroke={strokeColor} strokeWidth="2" points={pts} />
        {closes.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)} cy={toY(v)} r="4"
            fill="transparent"
            onMouseEnter={() => setTooltip({ i, v, x: toX(i), y: toY(v) })}
          />
        ))}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={PAD.t} x2={tooltip.x} y2={PAD.t + innerH}
              stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill={strokeColor} />
          </>
        )}
      </svg>
      {tooltip && (
        <div
          className="absolute bg-slate-800 text-white text-xs px-2 py-1 rounded-lg pointer-events-none"
          style={{ left: (tooltip.x / W * 100) + '%', top: 0, transform: 'translateX(-50%)' }}
        >
          ₹{tooltip.v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          {timestamps[tooltip.i] && <span className="block text-slate-300">{timestamps[tooltip.i].slice(0, 10)}</span>}
        </div>
      )}
    </div>
  );
};

// ─── Trend badge ──────────────────────────────────────────────────────────────
const TrendBadge = ({ pct, fmt }) => {
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 font-bold text-xs ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {fmt}
    </span>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-100 animate-pulse rounded-xl ${className}`} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Module-level Cache for Stale-While-Revalidate ───────────────────────────
let cachedMarketsData = null;

// Markets Page
// ═══════════════════════════════════════════════════════════════════════════════
const Markets = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────────
  const [indices,    setIndices]    = useState(cachedMarketsData?.indices || []);
  const [sectors,    setSectors]    = useState(cachedMarketsData?.sectors || []);
  const [allStocks,  setAllStocks]  = useState(cachedMarketsData?.allStocks || []);
  const [gainers,    setGainers]    = useState(cachedMarketsData?.gainers || []);
  const [losers,     setLosers]     = useState(cachedMarketsData?.losers || []);
  const [mostActive, setMostActive] = useState(cachedMarketsData?.mostActive || []);
  const [highVol,    setHighVol]    = useState(cachedMarketsData?.highVol || []);
  const [heatmap,    setHeatmap]    = useState(cachedMarketsData?.heatmap || []);
  const [breadth,    setBreadth]    = useState(cachedMarketsData?.breadth || null);
  const [corpActions,setCorpActions]= useState(cachedMarketsData?.corpActions || []);
  const [ipos,       setIpos]       = useState(cachedMarketsData?.ipos || []);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(!cachedMarketsData);
  const [marketOpen, setMarketOpen] = useState(isNSEOpen());
  const [lastRefresh, setLastRefresh] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [activeSector, setActiveSector] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'mktcap_cr', dir: 'desc' });
  const [activeMovers, setActiveMovers] = useState('gainers');
  const [drawerStock, setDrawerStock] = useState(null);
  const [drawerDetail, setDrawerDetail] = useState(null);
  const [drawerHistory, setDrawerHistory] = useState(null);
  const [drawerPeriod, setDrawerPeriod] = useState('1mo');
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [user, setUser] = useState({ full_name: '' });
  const PAGE_SIZE = 15;

  // ── Fetch helpers ─────────────────────────────────────────────────────────────
  const get = useCallback(async (url) => {
    const res = await axios.get(`${API}/${url}`, { headers: authHeaders() });
    return res.data;
  }, []);

  // ── Initial load — all sections in parallel ───────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [
        idxData, secData, stocksData, gData, lData, maData, hvData,
        hmData, bData, caData, ipoData
      ] = await Promise.allSettled([
        get('market/indices/'),
        get('market/sectors/'),
        get('market/all-stocks/'),
        get('market/gainers/'),
        get('market/losers/'),
        get('market/most-active/'),
        get('market/high-volume/'),
        get('market/heatmap/'),
        get('market/market-breadth/'),
        get('market/corporate-actions/'),
        get('market/upcoming-ipos/'),
      ]);

      const idx = idxData.status === 'fulfilled' ? idxData.value : [];
      const sec = secData.status === 'fulfilled' ? secData.value : [];
      const stocks = stocksData.status === 'fulfilled' ? stocksData.value : [];
      const g = gData.status === 'fulfilled' ? gData.value : [];
      const l = lData.status === 'fulfilled' ? lData.value : [];
      const ma = maData.status === 'fulfilled' ? maData.value : [];
      const hv = hvData.status === 'fulfilled' ? hvData.value : [];
      const hm = hmData.status === 'fulfilled' ? hmData.value : [];
      const b = bData.status === 'fulfilled' ? bData.value : null;
      const ca = caData.status === 'fulfilled' ? caData.value : [];
      const ipo = ipoData.status === 'fulfilled' ? ipoData.value : [];

      if (idxData.status    === 'fulfilled') setIndices(idx);
      if (secData.status    === 'fulfilled') setSectors(sec);
      if (stocksData.status === 'fulfilled') setAllStocks(stocks);
      if (gData.status      === 'fulfilled') setGainers(g);
      if (lData.status      === 'fulfilled') setLosers(l);
      if (maData.status     === 'fulfilled') setMostActive(ma);
      if (hvData.status     === 'fulfilled') setHighVol(hv);
      if (hmData.status     === 'fulfilled') setHeatmap(hm);
      if (bData.status      === 'fulfilled') setBreadth(b);
      if (caData.status     === 'fulfilled') setCorpActions(ca);
      if (ipoData.status    === 'fulfilled') setIpos(ipo);

      cachedMarketsData = {
        indices: idx,
        sectors: sec,
        allStocks: stocks,
        gainers: g,
        losers: l,
        mostActive: ma,
        highVol: hv,
        heatmap: hm,
        breadth: b,
        corpActions: ca,
        ipos: ipo
      };

      // Try to get user from localStorage/dashboard data
      const name = localStorage.getItem('user_name') || '';
      setUser({ full_name: name });
    } catch (e) {
      console.error('[Markets] loadAll error:', e);
    } finally {
      setInitialLoading(false);
    }
  }, [get]);

  // ── Live refresh — indices + movers + breadth every 12s ───────────────────────
  const liveRefresh = useCallback(async () => {
    if (!isNSEOpen()) {
      setMarketOpen(false);
      return;
    }
    setMarketOpen(true);
    try {
      const [idxData, gData, lData, maData, hvData, bData] = await Promise.allSettled([
        get('market/indices/'),
        get('market/gainers/'),
        get('market/losers/'),
        get('market/most-active/'),
        get('market/high-volume/'),
        get('market/market-breadth/'),
      ]);
      if (idxData.status === 'fulfilled') setIndices(idxData.value);
      if (gData.status   === 'fulfilled') setGainers(gData.value);
      if (lData.status   === 'fulfilled') setLosers(lData.value);
      if (maData.status  === 'fulfilled') setMostActive(maData.value);
      if (hvData.status  === 'fulfilled') setHighVol(hvData.value);
      if (bData.status   === 'fulfilled') setBreadth(bData.value);

      if (cachedMarketsData) {
        if (idxData.status === 'fulfilled') cachedMarketsData.indices = idxData.value;
        if (gData.status   === 'fulfilled') cachedMarketsData.gainers = gData.value;
        if (lData.status   === 'fulfilled') cachedMarketsData.losers = lData.value;
        if (maData.status  === 'fulfilled') cachedMarketsData.mostActive = maData.value;
        if (hvData.status  === 'fulfilled') cachedMarketsData.highVol = hvData.value;
        if (bData.status   === 'fulfilled') cachedMarketsData.breadth = bData.value;
      }
      setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.warn('[Markets] liveRefresh error:', e?.message);
    }
  }, [get]);

  // ── Mount effect ──────────────────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
    const interval = setInterval(liveRefresh, POLL_MS);
    return () => clearInterval(interval);
  }, [loadAll, liveRefresh]);

  // ── Search debounce ───────────────────────────────────────────────────────────
  const handleSearch = (q) => {
    setSearchQ(q);
    if (searchDebounce) clearTimeout(searchDebounce);
    if (!q.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const results = await get(`market/search/?q=${encodeURIComponent(q)}`);
        setSearchResults(results);
      } catch { setSearchResults([]); }
    }, 250);
    setSearchDebounce(t);
  };

  // ── Stock drawer open ─────────────────────────────────────────────────────────
  const openDrawer = useCallback(async (symbol) => {
    setDrawerStock(symbol);
    setDrawerDetail(null);
    setDrawerHistory(null);
    setDrawerLoading(true);
    setSearchResults([]);
    setSearchQ('');
    try {
      const [detail, hist] = await Promise.all([
        get(`market/stock/${symbol}/`),
        get(`market/stock/${symbol}/history/?period=${drawerPeriod}`),
      ]);
      setDrawerDetail(detail);
      setDrawerHistory(hist);
    } catch (e) {
      console.error('[Markets] drawer error:', e);
    } finally {
      setDrawerLoading(false);
    }
  }, [get, drawerPeriod]);

  // ── Period change inside drawer ───────────────────────────────────────────────
  const changePeriod = useCallback(async (period) => {
    setDrawerPeriod(period);
    if (!drawerStock) return;
    try {
      const hist = await get(`market/stock/${drawerStock}/history/?period=${period}`);
      setDrawerHistory(hist);
    } catch { }
  }, [drawerStock, get]);

  // ── Table helpers ─────────────────────────────────────────────────────────────
  const filteredStocks = (() => {
    let stocks = allStocks;
    if (activeSector) stocks = stocks.filter(s => s.sector === activeSector);
    const { key, dir } = sortConfig;
    stocks = [...stocks].sort((a, b) => {
      const av = a[key] ?? 0, bv = b[key] ?? 0;
      return dir === 'asc' ? av - bv : bv - av;
    });
    return stocks;
  })();

  const totalPages = Math.ceil(filteredStocks.length / PAGE_SIZE);
  const pageStocks = filteredStocks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }
    );
    setCurrentPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortConfig.key !== col) return <ChevronUp className="w-3 h-3 text-slate-300" />;
    return sortConfig.dir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#0F766E]" />
      : <ChevronDown className="w-3 h-3 text-[#0F766E]" />;
  };

  // ── Current movers list ───────────────────────────────────────────────────────
  const moversMap = { gainers, losers, mostActive, highVol };
  const moversKeys = ['gainers', 'losers', 'mostActive', 'highVol'];
  const moversLabels = { gainers: '📈 Top Gainers', losers: '📉 Top Losers', mostActive: '⚡ Most Active', highVol: '🔊 High Volume' };
  const currentMovers = moversMap[activeMovers] || [];

  // ── IST clock ─────────────────────────────────────────────────────────────────
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + 5.5 * 3600000);
      setClock(ist.toUTCString().slice(17, 22) + ' IST');
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Heatmap color ─────────────────────────────────────────────────────────────
  const heatColor = (pct) => {
    if (pct >= 3)   return '#065f46';
    if (pct >= 1.5) return '#059669';
    if (pct >= 0.5) return '#34d399';
    if (pct >= 0)   return '#6ee7b7';
    if (pct >= -0.5)return '#fca5a5';
    if (pct >= -1.5)return '#f87171';
    if (pct >= -3)  return '#ef4444';
    return '#b91c1c';
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Markets',   path: null, active: true },
    { label: 'Watchlist' }, { label: 'Portfolio' }, { label: 'Paper Trading' },
    { label: 'Orders' }, { label: 'Holdings' }, { label: 'AI Mentor' },
    { label: 'AI Simulation' }, { label: 'News' }, { label: 'Research Workspace' },
    { label: 'Alerts' }, { label: 'Settings' },
  ];

  // ── Loading screen ─────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold">Loading Markets...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">

      {/* ── LEFT SIDEBAR (Desktop) ── */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <LineChart className="w-8 h-8 text-[#0F766E]" />
            <div>
              <h1 className="text-xl font-bold text-[#0F766E] tracking-tight">StockSense</h1>
              <p className="text-xs text-slate-400 font-medium">Indian Stock Market AI</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => item.path && navigate(item.path)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                item.active
                  ? 'bg-emerald-50 text-[#0F766E]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-[#0F766E]' : 'bg-transparent'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm uppercase">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-bold text-slate-800 truncate">{user?.full_name || 'StockSense User'}</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pro Trader</p>
            </div>
            <button
              onClick={() => { localStorage.clear(); navigate('/login'); }}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <LineChart className="w-6 h-6 text-[#0F766E]" />
          <span className="text-lg font-bold text-[#0F766E]">StockSense</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map((item, i) => (
              <button key={i} onClick={() => { item.path && navigate(item.path); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-6 pb-24 px-4 lg:px-8">

        {/* ── SECTION 1: Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Markets</h2>
            <p className="text-slate-500 text-sm">
              Explore live NSE &amp; BSE market data
              {lastRefresh && <span className="ml-2 text-slate-400 text-xs">• Updated {lastRefresh}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">{clock}</span>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              marketOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${marketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
              {marketOpen ? 'Market Open' : 'Market Closed'}
            </span>
          </div>
        </div>

        {/* ── SECTION 2: Search ── */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQ}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search stocks by company name or symbol..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-5 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0F766E] outline-none transition-all"
            />
            {searchQ && (
              <button onClick={() => { setSearchQ(''); setSearchResults([]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl mt-2 z-50 overflow-hidden"
              >
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => openDrawer(r.symbol)}
                    className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-50 text-[#0F766E] font-bold text-xs flex items-center justify-center">{r.symbol[0]}</span>
                      <span className="font-bold text-sm text-slate-800">{r.symbol}</span>
                    </div>
                    <span className="text-xs text-slate-400">{r.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTION 3: Market Indices ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0F766E]" /> Market Indices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {indices.length === 0
              ? [1,2,3,4].map(n => <Skeleton key={n} className="h-36" />)
              : indices.map((idx, i) => (
                <motion.div
                  key={idx.key}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider">{idx.name}</p>
                      <h3 className="text-xl font-bold text-slate-800 mt-0.5">₹{idx.price}</h3>
                    </div>
                    <TrendBadge pct={idx.change_raw} fmt={idx.change_pct} />
                  </div>
                  <p className={`text-xs font-semibold ${idx.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {idx.change}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-400">
                    <span>O: <b className="text-slate-600">₹{idx.open}</b></span>
                    <span>H: <b className="text-emerald-600">₹{idx.high}</b></span>
                    <span>L: <b className="text-red-500">₹{idx.low}</b></span>
                    <span>PC: <b className="text-slate-600">₹{idx.prev_close}</b></span>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* ── SECTION 4: Sector Performance ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F766E]" /> Sector Performance
            </h3>
            {activeSector && (
              <button onClick={() => { setActiveSector(null); setCurrentPage(1); }}
                className="text-xs text-[#0F766E] font-bold flex items-center gap-1 hover:underline">
                <X className="w-3 h-3" /> Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sectors.map((sec, i) => (
              <motion.button
                key={sec.name}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { setActiveSector(activeSector === sec.name ? null : sec.name); setCurrentPage(1); }}
                className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
                  activeSector === sec.name
                    ? 'border-[#0F766E] bg-emerald-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 tracking-wider truncate">{sec.name.toUpperCase()}</p>
                <p className={`text-sm font-bold mt-1 ${sec.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {sec.change_fmt}
                </p>
                <div className="mt-2 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sec.trend === 'up' ? 'bg-emerald-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(100, Math.abs(sec.change_pct) * 25)}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">{sec.stock_count} stocks</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── SECTION 5: All Stocks Table ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#0F766E]" />
              All Stocks {activeSector ? `— ${activeSector}` : ''}
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                {filteredStocks.length}
              </span>
            </h3>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    {[
                      { label: 'Company',     key: 'name',       sortable: false },
                      { label: 'Price',       key: 'price',      sortable: true  },
                      { label: 'Change',      key: 'change',     sortable: true  },
                      { label: 'Change %',    key: 'change_pct', sortable: true  },
                      { label: 'Volume',      key: 'volume',     sortable: false },
                      { label: 'Mkt Cap',     key: 'mktcap_cr',  sortable: true  },
                      { label: '52W High',    key: 'high_52w',   sortable: false },
                      { label: '52W Low',     key: 'low_52w',    sortable: false },
                      { label: 'Actions',     key: null,         sortable: false },
                    ].map(col => (
                      <th key={col.label} className="px-4 py-4 text-[10px] font-bold tracking-wider whitespace-nowrap">
                        {col.sortable
                          ? <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-slate-600">
                              {col.label} <SortIcon col={col.key} />
                            </button>
                          : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pageStocks.map((s, i) => (
                    <motion.tr
                      key={s.symbol}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            s.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'
                          }`}>{s.logo}</div>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{s.symbol}</p>
                            <p className="text-[9px] text-slate-400 w-28 truncate">{s.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-xs text-slate-800">₹{s.price_fmt}</td>
                      <td className={`px-4 py-3 font-bold text-xs ${s.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {s.change_fmt}
                      </td>
                      <td className="px-4 py-3">
                        <TrendBadge pct={s.change_pct} fmt={s.change_pct_fmt} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{s.volume}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-semibold">{s.mktcap_fmt}</td>
                      <td className="px-4 py-3 text-xs text-emerald-600 font-semibold">₹{s.high_52w}</td>
                      <td className="px-4 py-3 text-xs text-red-500 font-semibold">₹{s.low_52w}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button title="Add to Watchlist"
                            className="p-1.5 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-500 transition-colors">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button title="Paper Trade"
                            className="p-1.5 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-[#0F766E] transition-colors">
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button title="View Details" onClick={() => openDrawer(s.symbol)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-500 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="p-4 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-semibold">
                Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredStocks.length)}–{Math.min(currentPage * PAGE_SIZE, filteredStocks.length)} of {filteredStocks.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      currentPage === i + 1
                        ? 'bg-[#0F766E] text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >{i + 1}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 6: Top Movers ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0F766E]" /> Top Movers
          </h3>
          {/* Tab selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {moversKeys.map(k => (
              <button key={k} onClick={() => setActiveMovers(k)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeMovers === k
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}>
                {moversLabels[k]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentMovers.slice(0, 8).map((s, i) => (
              <motion.button
                key={s.symbol}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDrawer(s.symbol)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left w-full"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    s.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'
                  }`}>{s.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{s.symbol}</p>
                    <p className="text-[9px] text-slate-400 truncate">{s.name}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">₹{s.price_fmt}</span>
                  <TrendBadge pct={s.change_pct} fmt={s.change_pct_fmt} />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Vol: {s.volume}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── SECTION 7: Heatmap ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0F766E]" /> Market Heatmap
            <span className="text-[10px] text-slate-400 font-normal">Size = Market Cap</span>
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            {/* Legend */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {[[-4,'#b91c1c'],[-2,'#ef4444'],[0,'#fca5a5'],[0.5,'#6ee7b7'],[2,'#059669'],[4,'#065f46']].map(([v,c])=>(
                <div key={v} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{background:c}} />
                  <span className="text-[10px] text-slate-500 font-semibold">{v >= 0 ? '+' : ''}{v}%</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {heatmap.map((s, i) => (
                <motion.button
                  key={s.symbol}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => openDrawer(s.symbol)}
                  className="flex flex-col items-center justify-center rounded-xl text-white transition-all hover:opacity-90 hover:scale-105 font-bold"
                  style={{
                    background: heatColor(s.change_pct),
                    width:  `${Math.max(56, s.weight * 14)}px`,
                    height: `${Math.max(48, s.weight * 12)}px`,
                    minWidth: '56px',
                  }}
                  title={`${s.name}: ${s.change_fmt}`}
                >
                  <span className="text-[9px] leading-tight px-1 truncate max-w-full">{s.symbol}</span>
                  <span className="text-[8px] opacity-90">{s.change_fmt}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 9: Market Breadth ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0F766E]" /> Market Breadth
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Advancing',   val: breadth?.advancing, color: 'text-emerald-600', bg: 'bg-emerald-50',  icon: <TrendingUp className="w-5 h-5 text-emerald-600" /> },
              { label: 'Declining',   val: breadth?.declining,  color: 'text-red-500',     bg: 'bg-red-50',     icon: <TrendingDown className="w-5 h-5 text-red-500" /> },
              { label: 'Unchanged',   val: breadth?.unchanged,  color: 'text-slate-600',   bg: 'bg-slate-50',   icon: <Activity className="w-5 h-5 text-slate-400" /> },
              { label: 'A/D Ratio',   val: breadth?.ad_ratio_fmt, color: breadth?.bullish ? 'text-emerald-600' : 'text-red-500', bg: 'bg-white', icon: <BarChart2 className="w-5 h-5 text-[#0F766E]" /> },
            ].map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>{card.icon}</div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">{card.label.toUpperCase()}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {breadth ? card.val : <Skeleton className="h-7 w-16 mt-1" />}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SECTION 10: Corporate Actions ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0F766E]" /> Corporate Actions
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    {['Company', 'Action', 'Ex-Date', 'Record Date', 'Details'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-bold tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {corpActions.map((ca, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-xs text-slate-800">{ca.company}</p>
                        <p className="text-[9px] text-slate-400">{ca.symbol}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full ${
                          ca.action === 'Dividend' ? 'bg-emerald-50 text-emerald-700' :
                          ca.action === 'Bonus'    ? 'bg-blue-50 text-blue-600' :
                          ca.action === 'Split'    ? 'bg-purple-50 text-purple-600' :
                                                     'bg-amber-50 text-amber-600'
                        }`}>{ca.action}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{ca.ex_date}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{ca.record_date}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-700">{ca.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── SECTION 11: Upcoming IPOs ── */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-[#0F766E]" /> Upcoming IPOs
          </h3>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    {['Company', 'Open Date', 'Close Date', 'Price Band', 'Lot Size', 'Listing', 'GMP', 'Status'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-bold tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ipos.map((ipo, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-xs text-slate-800 whitespace-nowrap">{ipo.name}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold whitespace-nowrap">{ipo.open}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold whitespace-nowrap">{ipo.close}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-700 whitespace-nowrap">{ipo.price_band}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{ipo.lot}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold whitespace-nowrap">{ipo.listing}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-emerald-600">{ipo.gmp}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full ${
                          ipo.status === 'Listed'   ? 'bg-emerald-50 text-emerald-700' :
                          ipo.status === 'Open'     ? 'bg-blue-50 text-blue-600' :
                                                      'bg-amber-50 text-amber-600'
                        }`}>{ipo.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 8: Stock Details Drawer (Sections 8 + Price Chart inside)
          ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerStock && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-sm"
              onClick={() => setDrawerStock(null)}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  {drawerDetail
                    ? <>
                        <h3 className="font-bold text-lg text-slate-800">{drawerDetail.symbol}</h3>
                        <p className="text-xs text-slate-400">{drawerDetail.name}</p>
                      </>
                    : <Skeleton className="h-6 w-32" />}
                </div>
                <button onClick={() => setDrawerStock(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {drawerLoading
                  ? <div className="space-y-3">{[1,2,3,4].map(n=><Skeleton key={n} className="h-12"/>)}</div>
                  : drawerDetail && <>
                      {/* Price */}
                      <div className={`p-4 rounded-2xl ${drawerDetail.trend === 'up' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                        <p className="text-[10px] font-bold text-slate-400 tracking-wider">CURRENT PRICE</p>
                        <h2 className="text-3xl font-bold text-slate-800 mt-1">₹{drawerDetail.price}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendBadge pct={drawerDetail.change_raw} fmt={drawerDetail.change_pct} />
                          <span className={`text-xs font-semibold ${drawerDetail.trend==='up'?'text-emerald-600':'text-red-500'}`}>
                            {drawerDetail.change}
                          </span>
                        </div>
                      </div>

                      {/* OHLC Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Open',       drawerDetail.open],
                          ['High',       drawerDetail.high],
                          ['Low',        drawerDetail.low],
                          ['Prev Close', drawerDetail.prev_close],
                          ['52W High',   drawerDetail.high_52w],
                          ['52W Low',    drawerDetail.low_52w],
                          ['Volume',     drawerDetail.volume],
                          ['Mkt Cap',    drawerDetail.mktcap],
                          ['P/E Ratio',  drawerDetail.pe_ratio],
                          ['Div Yield',  drawerDetail.div_yield],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[9px] font-bold text-slate-400 tracking-wider">{label.toUpperCase()}</p>
                            <p className="text-sm font-bold text-slate-700 mt-0.5">{val || '—'}</p>
                          </div>
                        ))}
                      </div>

                      {/* Price Chart — Section 8 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-600">Price Chart</p>
                          <div className="flex gap-1">
                            {['1d','5d','1mo','3mo','6mo','1y','5y'].map(p => (
                              <button key={p} onClick={() => changePeriod(p)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  drawerPeriod === p
                                    ? 'bg-[#0F766E] text-white'
                                    : 'text-slate-400 hover:bg-slate-100'
                                }`}>{p.toUpperCase()}</button>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3">
                          {drawerHistory
                            ? <PriceChart
                                closes={drawerHistory.closes}
                                timestamps={drawerHistory.timestamps}
                              />
                            : <Skeleton className="h-36" />}
                        </div>
                      </div>

                      {/* Sector badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">SECTOR</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-[#0F766E] text-[10px] font-bold rounded-full">
                          {drawerDetail.sector}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center gap-1.5 p-3 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-colors group">
                          <Star className="w-5 h-5 text-amber-500" />
                          <span className="text-[10px] font-bold text-amber-600">Watchlist</span>
                        </button>
                        <button className="flex flex-col items-center gap-1.5 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl transition-colors">
                          <TrendingUp className="w-5 h-5 text-[#0F766E]" />
                          <span className="text-[10px] font-bold text-[#0F766E]">Paper Trade</span>
                        </button>
                        <button className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors">
                          <BarChart2 className="w-5 h-5 text-blue-500" />
                          <span className="text-[10px] font-bold text-blue-500">Compare</span>
                        </button>
                      </div>
                    </>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Markets;
