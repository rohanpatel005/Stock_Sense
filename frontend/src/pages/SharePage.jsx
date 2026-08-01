import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, LogOut, Menu, X, LineChart } from 'lucide-react';

import Sidebar from '../components/Common/Sidebar';
import Header from '../components/share/Header';
import PriceCard from '../components/share/PriceCard';
import LiveChart from '../components/share/LiveChart';
import TradeModal from '../components/share/TradeModal';
import CandlestickChart from '../components/share/CandlestickChart';
import TechnicalIndicators from '../components/share/TechnicalIndicators';
import TechnicalSignals from '../components/share/TechnicalSignals';
import ValuationCard from '../components/share/ValuationCard';
import RiskMeter from '../components/share/RiskMeter';
import SupportResistance from '../components/share/SupportResistance';
import { FinancialHighlights, AIAnalysis } from '../components/share/FinancialsAndAI';
import { QuarterlyResults, AnnualResults } from '../components/share/FinancialResults';
import { PeerComparison, RelatedStocks } from '../components/share/PeerComparison';
import { CompanyProfile, Ownership, PerformanceCards, News, Events } from '../components/share/ProfileNewsEvents';

const SharePage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tradeAction, setTradeAction] = useState(null); // 'BUY' or 'SELL' or null
  const [askAiText, setAskAiText] = useState('');
  const [aiChat, setAiChat] = useState([]);

  // Local storage logged-in user parser
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : { full_name: 'StockSense User' };
    } catch (e) {
      return { full_name: 'StockSense User' };
    }
  });

  const fetchStockData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`http://127.0.0.1:8000/api/share/${symbol}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to retrieve stock insights. Please ensure you are logged in and the symbol is valid.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!askAiText.trim()) return;
    const newChat = [...aiChat, { sender: 'user', text: askAiText }];
    setAiChat(newChat);
    setAskAiText('');
    
    setTimeout(() => {
      setAiChat([
        ...newChat,
        { sender: 'ai', text: `Analyzing your query regarding ${symbol}: Support is at ₹${data?.support_resistance?.s1.toFixed(2)}, and overall recommendation is ${data?.technical_signals?.recommendation}.` }
      ]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-semibold">Aggregating real-time insights for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-slate-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-800">Aggregation Error</h2>
          <p className="text-slate-500 font-semibold text-sm leading-relaxed">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={fetchStockData}
              className="flex-1 bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar activePage="market" user={user} />

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
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Markets',   path: '/market'    },
              'Portfolio',
              'Orders', 'Holdings', 'AI Mentor', 'AI Simulation', 'News',
              'Research Workspace', 'Alerts', 'Settings'
            ].map((item, index) => {
              const label = typeof item === 'string' ? item : item.label;
              const path  = typeof item === 'string' ? null : item.path;
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (path) navigate(path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-6 pb-24 px-4 lg:px-8 space-y-6">
        
        {/* Render Trade Modal */}
        <TradeModal 
          isOpen={!!tradeAction} 
          onClose={() => setTradeAction(null)} 
          action={tradeAction} 
          symbol={symbol} 
          companyName={data?.company_name} 
          userWallet={user?.wallet}
          livePrice={data?.live_price}
          onTradeSuccess={() => {
            fetchStockData();
          }}
        />
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-400">Share / {symbol}</span>
          {data?.data_stale && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              Stale Data (Connection issues)
            </span>
          )}
        </div>

        {/* 1. Header Information */}
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <Header 
                data={data} 
                onBuyClick={() => setTradeAction('BUY')} 
                onSellClick={() => setTradeAction('SELL')} 
              />
            </div>
          </div>

        {/* 2. Top Metric Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <PriceCard data={data} />
          </div>
          <div className="lg:col-span-4">
            <ValuationCard data={data?.valuation} />
          </div>
        </div>

        {/* 3. Volatility, Support, Signal Summaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RiskMeter data={data?.risk_meter} />
          <SupportResistance data={data?.support_resistance} />
          <TechnicalSignals data={data?.technical_signals} />
        </div>

        {/* 4. Interactive Area & Candlestick Charts */}
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <LiveChart chartsData={data?.charts} />
          </div>
          <div className="w-full">
            <CandlestickChart data={data?.candlestick_data} />
          </div>
        </div>

        {/* 5. Indicators details */}
        <TechnicalIndicators data={data?.technical_indicators} />

        {/* 6. Financial Overview & AI summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <FinancialHighlights data={data?.financial_highlights} />
          </div>
          <div className="lg:col-span-4">
            <AIAnalysis data={data?.ai_analysis} />
          </div>
        </div>

        {/* 7. Shareholders details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <Ownership data={data?.ownership} />
          </div>
          <div className="lg:col-span-6">
            <PerformanceCards data={data?.performance} />
          </div>
        </div>

        {/* 8. Quarterly & Annual Financial results tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <QuarterlyResults data={data?.quarterly_results} />
          </div>
          <div className="lg:col-span-6">
            <AnnualResults data={data?.annual_results} />
          </div>
        </div>

        {/* 9. Related Peers comparator */}
        <PeerComparison data={data?.peer_comparison} />
        <RelatedStocks data={data?.related_stocks} />

        {/* 10. Business details, news and actions */}
        <CompanyProfile data={data?.profile} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <News data={data?.news} />
          </div>
          <div className="lg:col-span-4">
            <Events data={data?.events} />
          </div>
        </div>

        {/* Floating Chat Widget */}
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
                setAiChat([{ sender: 'ai', text: `Hello! Ask me any questions about ${symbol}!` }]);
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

export default SharePage;
