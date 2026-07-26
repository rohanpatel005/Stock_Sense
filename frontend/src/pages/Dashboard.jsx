import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, ArrowUpRight, Search, 
  Settings, Bell, Sparkles, HelpCircle, LogOut, 
  Menu, X, LineChart, PieChart, Clock, Layers, BookOpen, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Top Gainers & Losers States
  const [gainers, setGainers] = useState([]);
  const [gainersLoading, setGainersLoading] = useState(true);
  const [gainersError, setGainersError] = useState('');
  
  const [losers, setLosers] = useState([]);
  const [losersLoading, setLosersLoading] = useState(true);
  const [losersError, setLosersError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [askAiText, setAskAiText] = useState('');
  const [aiChat, setAiChat] = useState([]);

  // Stocks database for search autocomplete
  const INDIAN_STOCKS = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd' },
    { symbol: 'TCS', name: 'Tata Consultancy Services' },
    { symbol: 'INFY', name: 'Infosys Limited' },
    { symbol: 'SBIN', name: 'State Bank of India' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Limited' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited' },
    { symbol: 'LT', name: 'Larsen & Toubro Limited' }
  ];

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/dashboard/data/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopGainers = async () => {
    setGainersLoading(true);
    setGainersError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/market/top-gainers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGainers(response.data);
    } catch (err) {
      setGainersError('Unable to load Top Gainers.');
    } finally {
      setGainersLoading(false);
    }
  };

  const fetchTopLosers = async () => {
    setLosersLoading(true);
    setLosersError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/api/market/top-losers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLosers(response.data);
    } catch (err) {
      setLosersError('Unable to load Top Losers.');
    } finally {
      setLosersLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTopGainers();
    fetchTopLosers();

    // Auto-refresh leaders/laggards every 60 seconds
    const interval = setInterval(() => {
      fetchTopGainers();
      fetchTopLosers();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = INDIAN_STOCKS.filter(
        stock => stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
                 stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!askAiText.trim()) return;
    const newChat = [...aiChat, { sender: 'user', text: askAiText }];
    setAiChat(newChat);
    setAskAiText('');
    
    // Simulate AI response
    setTimeout(() => {
      setAiChat([
        ...newChat,
        { sender: 'ai', text: `Analyzing ${askAiText}... RELIANCE, TCS and NIFTY 50 show bullish sentiment. Indicators suggest holding positions.` }
      ]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-semibold">Loading StockSense Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Connection Error</h2>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">
      
      {/* LEFT SIDEBAR (Desktop) */}
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

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { label: 'Dashboard', active: true },
            { label: 'Markets' },
            { label: 'Watchlist' },
            { label: 'Portfolio' },
            { label: 'Paper Trading' },
            { label: 'Orders' },
            { label: 'Holdings' },
            { label: 'AI Mentor' },
            { label: 'AI Simulation' },
            { label: 'News' },
            { label: 'Research Workspace' },
            { label: 'Alerts' },
            { label: 'Settings' }
          ].map((item, index) => (
            <button
              key={index}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                item.active 
                  ? 'bg-emerald-50 text-[#0F766E]' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-[#0F766E]' : 'bg-transparent'}`}></span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm uppercase">
              {data.user?.full_name ? data.user.full_name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <h4 className="text-sm font-bold text-slate-800 truncate">
                {data.user?.full_name || 'StockSense User'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pro Trader</p>
            </div>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <LineChart className="w-6 h-6 text-[#0F766E]" />
          <span className="text-lg font-bold text-[#0F766E]">StockSense</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto p-4 flex flex-col">
          <nav className="space-y-1">
            {[
              'Dashboard', 'Markets', 'Watchlist', 'Portfolio', 'Paper Trading', 
              'Orders', 'Holdings', 'AI Mentor', 'AI Simulation', 'News', 
              'Research Workspace', 'Alerts', 'Settings'
            ].map((label, index) => (
              <button
                key={index}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-6 pb-24 px-4 lg:px-8">
        
        {/* TOP BAR / SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">StockSense India</h2>
            <p className="text-slate-500 text-sm">Timings: 9:15 AM - 3:30 PM (IST)</p>
          </div>
          
          {/* Autocomplete Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search NSE/BSE stocks..."
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-[#0F766E] outline-none transition-all"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl mt-2 z-50 overflow-hidden divide-y divide-slate-50">
                {searchResults.map((stock, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(stock.symbol);
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-800">{stock.symbol}</span>
                    <span className="text-xs text-slate-400">{stock.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 1. TOP SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          
          {/* Card 1: NIFTY 50 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 tracking-wider">NIFTY 50</p>
            <h3 className="text-lg font-bold text-slate-800 mt-2">{data.summary.nifty_50.value}</h3>
            <div className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.nifty_50.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.summary.nifty_50.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.summary.nifty_50.change} ({data.summary.nifty_50.change_percent})</span>
            </div>
          </div>

          {/* Card 2: SENSEX */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 tracking-wider">SENSEX</p>
            <h3 className="text-lg font-bold text-slate-800 mt-2">{data.summary.sensex.value}</h3>
            <div className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.sensex.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.summary.sensex.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.summary.sensex.change} ({data.summary.sensex.change_percent})</span>
            </div>
          </div>

          {/* Card 3: BANK NIFTY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 tracking-wider">BANK NIFTY</p>
            <h3 className="text-lg font-bold text-slate-800 mt-2">{data.summary.bank_nifty.value}</h3>
            <div className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.bank_nifty.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.summary.bank_nifty.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{data.summary.bank_nifty.change} ({data.summary.bank_nifty.change_percent})</span>
            </div>
          </div>

          {/* Card 4: Portfolio Value */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PORTFOLIO VALUE</p>
            <h3 className="text-lg font-bold text-slate-800 mt-2">₹{data.summary.portfolio.current_value.toLocaleString('en-IN')}</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold">₹{data.summary.portfolio.today_pl.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Card 5: Wallet Balance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PAPER WALLET</p>
            <h3 className="text-lg font-bold text-slate-800 mt-2">₹{data.summary.wallet.current.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Initial: ₹50,000</p>
          </div>

          {/* Card 6: AI Market Mood */}
          <div className="bg-emerald-900/5 backdrop-blur-xl p-5 rounded-2xl border border-emerald-600/20 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center gap-2 text-[#0F766E]">
              <Sparkles className="w-4 h-4 fill-[#0F766E]/20" />
              <span className="text-xs font-bold tracking-wider">AI MARKET MOOD</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-[#0F766E]">{data.summary.ai_mood.mood}</span>
              <span className="text-xs font-bold text-[#0F766E]">{data.summary.ai_mood.confidence}% Conf.</span>
            </div>
          </div>

        </section>

        {/* 2. SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SECTION (Col 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Market Overview Indices mini-cards */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Market Overview</h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">IST Timings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.market_overview.map((market, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors">
                    <span className="text-xs font-bold text-slate-400">{market.symbol}</span>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-sm font-bold text-slate-800">₹{market.value}</span>
                      <div className={`flex items-center gap-0.5 text-xs font-bold ${market.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {market.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{market.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Stocks Grid */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Trending Stocks</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.trending_stocks.map((stock, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-2xl bg-white hover:border-slate-200 transition-all flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${stock.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>{stock.logo}</div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{stock.symbol}</p>
                        <p className="text-[10px] text-slate-400 truncate w-24">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline mt-4">
                      <span className="text-sm font-bold">₹{stock.price}</span>
                      <div className={`flex items-center gap-0.5 text-xs font-bold ${stock.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stock.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{stock.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Gainers & Losers Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Gainers */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-emerald-700 mb-4 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> TOP GAINERS
                </h4>
                {gainersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : gainersError ? (
                  <p className="text-sm text-slate-400 font-semibold text-center py-4">{gainersError}</p>
                ) : (
                  <div className="space-y-3">
                    {gainers.map((stock, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-emerald-50/30 rounded-xl border border-emerald-500/10 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">{stock.logo}</div>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{stock.symbol}</p>
                            <p className="text-[9px] text-slate-400 truncate w-32">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-xs text-slate-600 font-semibold">₹{stock.price}</p>
                          <div className="flex items-center gap-0.5 mt-0.5 text-emerald-600">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">+{stock.change_percent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Losers */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-red-500 mb-4 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> TOP LOSERS
                </h4>
                {losersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : losersError ? (
                  <p className="text-sm text-slate-400 font-semibold text-center py-4">{losersError}</p>
                ) : (
                  <div className="space-y-3">
                    {losers.map((stock, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-red-50/30 rounded-xl border border-red-500/10 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs">{stock.logo}</div>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{stock.symbol}</p>
                            <p className="text-[9px] text-slate-400 truncate w-32">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-xs text-slate-600 font-semibold">₹{stock.price}</p>
                          <div className="flex items-center gap-0.5 mt-0.5 text-red-500">
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{stock.change_percent}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Heatmap & FII/DII Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FII DII Activity */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">FII / DII Activity</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">FII Buying</span>
                    <span className="font-bold text-slate-800">{data.fii_dii.fii_buy}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">DII Buying</span>
                    <span className="font-bold text-slate-800">{data.fii_dii.dii_buy}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-slate-55 pt-3">
                    <span className="text-slate-800 font-bold">Net Flow</span>
                    <span className="font-bold text-emerald-600">{data.fii_dii.net_flow}</span>
                  </div>
                </div>
              </div>

              {/* Options Data */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Options Data (Nifty)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">PCR</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{data.options_data.pcr}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">Max Pain</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{data.options_data.max_pain}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">Open Interest</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{data.options_data.open_interest}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-400 font-semibold">IV</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{data.options_data.iv}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Paper Trades */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Recent Paper Trades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">STOCK</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">TYPE</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">QTY</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">PRICE</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">P/L</th>
                      <th className="px-6 py-4 text-xs font-bold tracking-wider">TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recent_trades && data.recent_trades.length > 0 ? (
                      data.recent_trades.map((trade, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-sm text-slate-800">{trade.symbol}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${trade.type === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>{trade.type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{trade.quantity}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-semibold">₹{trade.price}</td>
                          <td className={`px-6 py-4 text-sm font-bold ${trade.pl.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>₹{trade.pl}</td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-semibold">{trade.timestamp}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                          No records available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Col 4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Watchlist */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Watchlist</h3>
                <span className="text-xs text-slate-400 font-bold cursor-pointer hover:underline">+ Add</span>
              </div>
              <div className="space-y-4">
                {data.watchlist.map((stock, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{stock.symbol}</p>
                      <p className="text-[10px] text-slate-400 truncate w-32">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">₹{stock.price}</p>
                      <div className={`flex items-center gap-0.5 justify-end text-[10px] font-bold ${stock.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {stock.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{stock.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector Performance */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Sector Performance</h3>
              <div className="space-y-4">
                {data.sector_performance.map((sector, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{sector.sector}</span>
                      <span className={sector.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}>{sector.change}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${sector.change.startsWith('+') ? 'bg-emerald-600' : 'bg-red-500'}`} 
                        style={{ width: `${Math.min(100, Math.abs(parseFloat(sector.change)) * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights & Confidence Score (Glassmorphic) */}
            <div className="bg-emerald-950/5 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 text-emerald-800">
                <Sparkles className="w-5 h-5 fill-emerald-800/10" />
                <h3 className="font-bold text-sm tracking-wider">AI INSIGHTS & CONFIDENCE</h3>
              </div>
              
              <div className="space-y-3">
                {data.ai_insights.map((insight, idx) => (
                  <p key={idx} className="text-xs text-slate-700 font-medium leading-relaxed bg-white/50 p-3 rounded-xl border border-white/40">
                    {insight}
                  </p>
                ))}
              </div>

              <div className="border-t border-slate-100/10 pt-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-slate-500 font-semibold">AI Confidence Score</span>
                  <span className="text-lg font-bold text-emerald-800">88%</span>
                </div>
                <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Indian Market News */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Market News</h3>
              <div className="space-y-4">
                {data.news.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{item.source}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{item.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug hover:text-emerald-700 cursor-pointer transition-colors">
                      {item.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 3. RIGHT FLOATING CHAT WIDGET (FAB for AI chat popup) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {aiChat.length > 0 && (
            <div className="w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl mb-4 overflow-hidden flex flex-col max-h-96">
              <div className="bg-emerald-800 text-white p-4 font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 fill-white/10" />
                Ask StockSense AI
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-64 custom-scrollbar bg-slate-50/50">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-700 text-white self-end ml-auto' 
                      : 'bg-white text-slate-800 border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAskAI} className="p-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={askAiText}
                  onChange={(e) => setAskAiText(e.target.value)}
                  placeholder="Ask stock queries..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-700"
                />
                <button type="submit" className="bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl">Send</button>
              </form>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (aiChat.length === 0) {
                setAiChat([{ sender: 'ai', text: 'Hello! I am your StockSense AI assistant. Ask me anything about Indian stocks!' }]);
              } else {
                setAiChat([]);
              }
            }}
            className="bg-[#0F766E] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-800 transition-all transform active:scale-95 z-50"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        </div>

      </main>

    </div>
  );
};

export default Dashboard;
