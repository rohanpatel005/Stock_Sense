import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, LogOut, Menu, X, LineChart } from 'lucide-react';
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

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!askAiText.trim()) return;
    const currentQuery = askAiText;
    const newChat = [...aiChat, { sender: 'user', text: currentQuery }];
    setAiChat(newChat);
    setAskAiText('');
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai/chat/",
        { message: currentQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiChat([
        ...newChat,
        {
          sender: "ai",
          text: response.data.reply || "I'm sorry, I couldn't process that request.",
        },
      ]);
    } catch (err) {
      setAiChat([
        ...newChat,
        {
          sender: "ai",
          text: "I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 relative z-10">
        <div className="w-12 h-12 border-4 border-[#00E0A4] border-t-transparent rounded-full animate-spin drop-shadow-[0_0_10px_rgba(0,224,164,0.5)]"></div>
        <p className="text-slate-400 font-bold">Aggregating real-time insights for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10">
        <div className="bg-[#0B1118]/80 backdrop-blur-xl p-8 rounded-[24px] shadow-2xl max-w-md w-full text-center space-y-4 border border-white/10 premium-glass-card">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <h2 className="text-2xl font-bold text-white">Aggregation Error</h2>
          <p className="text-slate-400 font-semibold text-sm leading-relaxed">{error}</p>
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white/5 text-slate-300 font-bold py-3 rounded-[16px] hover:bg-white/10 hover:text-white border border-white/10 transition-all text-sm focus:outline-none"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={fetchStockData}
              className="flex-1 bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-[#05070D] font-bold py-3 rounded-[16px] hover:from-[#00E0A4] hover:to-[#00E0A4] transition-all text-sm shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] focus:outline-none"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 pt-20 lg:pt-6 pb-24 px-4 lg:px-8 space-y-8 relative z-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
        
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
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-[12px] transition-all text-slate-400 hover:text-white shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 transition-transform hover:-translate-x-0.5" />
          </button>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Share / <span className="text-white">{symbol}</span></span>
          {data?.data_stale && (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]">
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
        


        {/* Floating Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {aiChat.length > 0 && (
            <div className="w-80 bg-[#0B1118]/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.5)] mb-4 overflow-hidden flex flex-col max-h-96 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="bg-gradient-to-r from-[#00E0A4]/20 to-[#00E0A4]/5 border-b border-white/5 text-white p-4 font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E0A4] drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                Ask StockSense AI
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-64 custom-scrollbar bg-transparent">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[85%] font-medium ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-[#05070D] self-end ml-auto shadow-[0_0_10px_rgba(0,224,164,0.2)]' 
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAskAI} className="p-3 border-t border-white/5 flex gap-2 bg-[#05070D]/50">
                <input
                  type="text"
                  value={askAiText}
                  onChange={(e) => setAskAiText(e.target.value)}
                  placeholder="Ask stock queries..."
                  className="flex-1 text-xs bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-3 py-2 outline-none focus:border-[#00E0A4]/50 focus:ring-1 focus:ring-[#00E0A4]/30 transition-all"
                />
                <button type="submit" className="bg-white/10 hover:bg-[#00E0A4]/20 text-[#00E0A4] border border-white/10 hover:border-[#00E0A4]/30 text-xs font-bold px-4 py-2 rounded-xl transition-all">Send</button>
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
            className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 hover:border-[#00E0A4]/50 text-[#00E0A4] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(0,224,164,0.15)] hover:shadow-[0_0_30px_rgba(0,224,164,0.3)] flex items-center justify-center transition-all transform hover:-translate-y-1 active:scale-95 z-50 group"
          >
            <Sparkles className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(0,224,164,0.8)] transition-all" />
          </button>
        </div>

      </main>
    );
};

export default SharePage;
