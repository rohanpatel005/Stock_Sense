import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Search,
  Settings,
  Bell,
  Sparkles,
  HelpCircle,
  LogOut,
  Menu,
  X,
  LineChart,
  PieChart,
  Clock,
  Layers,
  BookOpen,
  AlertCircle,
  Star,
} from "lucide-react";
import { useWatchlist } from "../context/WatchlistContext";

// ─── Flash-animation CSS injected once ──────────────────────────────────────
const FLASH_STYLE = `
  @keyframes flash-green {
    0%   { background-color: transparent; }
    25%  { background-color: #d1fae5; }
    100% { background-color: transparent; }
  }
  @keyframes flash-red {
    0%   { background-color: transparent; }
    25%  { background-color: #fee2e2; }
    100% { background-color: transparent; }
  }
  .flash-up   { animation: flash-green 1.5s ease; border-radius: 4px; }
  .flash-down { animation: flash-red   1.5s ease; border-radius: 4px; }
`;

// ─── NSE market-hours helper (IST = UTC+5:30) ────────────────────────────────
const isNSEOpen = () => {
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + istOffset) % (24 * 60);
  const istHour = Math.floor(istMinutes / 60);
  const istMin = istMinutes % 60;
  // Check weekday in IST (approximate — offset doesn't change the date here)
  const istDay = now.getUTCDay(); // close enough for IST Mon–Fri
  if (istDay === 0 || istDay === 6) return false; // Sunday or Saturday
  // 9:15 → 9*60+15=555   15:30 → 15*60+30=930
  const openMin = 9 * 60 + 15;
  const closeMin = 15 * 60 + 30;
  const currentMin = istHour * 60 + istMin;
  return currentMin >= openMin && currentMin <= closeMin;
};

// ─── Module-level Cache for Stale-While-Revalidate ───────────────────────────
let cachedDashboardData = null;
let cachedGainers = [];
let cachedLosers = [];
let cachedGainersIsLive = true;
let cachedGainersLastUpdated = "";
let cachedLosersIsLive = true;
let cachedLosersLastUpdated = "";
let cachedActive = [];
let cachedActiveIsLive = true;
let cachedActiveLastUpdated = "";

const Dashboard = () => {
  const navigate = useNavigate();
  const { watchlist, watchlistData, toggleWatchlist } = useWatchlist();
  const [data, setData] = useState(cachedDashboardData);
  const [loading, setLoading] = useState(!cachedDashboardData);
  const [error, setError] = useState("");

  // ── Live-refresh state ──────────────────────────────────────────────────
  // marketStatus: { is_open: bool, label: string, fetched_at: string }
  const [marketStatus, setMarketStatus] = useState({
    is_open: true,
    label: "",
  });
  const [lastRefreshed, setLastRefreshed] = useState("");
  // flashMap: { [key]: 'up' | 'down' | null } — drives CSS flash per price element
  const [flashMap, setFlashMap] = useState({});
  // Keep a ref to the previous prices to detect changes
  const prevPricesRef = useRef({});

  const [gainers, setGainers] = useState(cachedGainers);
  const [gainersLoading, setGainersLoading] = useState(
    cachedGainers.length === 0,
  );
  const [gainersError, setGainersError] = useState("");
  const [gainersIsLive, setGainersIsLive] = useState(cachedGainersIsLive);
  const [gainersLastUpdated, setGainersLastUpdated] = useState(
    cachedGainersLastUpdated,
  );

  const [losers, setLosers] = useState(cachedLosers);
  const [losersLoading, setLosersLoading] = useState(cachedLosers.length === 0);
  const [losersError, setLosersError] = useState("");
  const [losersIsLive, setLosersIsLive] = useState(cachedLosersIsLive);
  const [losersLastUpdated, setLosersLastUpdated] = useState(
    cachedLosersLastUpdated,
  );

  const [active, setActive] = useState(cachedActive);
  const [activeLoading, setActiveLoading] = useState(cachedActive.length === 0);
  const [activeError, setActiveError] = useState("");
  const [activeIsLive, setActiveIsLive] = useState(cachedActiveIsLive);
  const [activeLastUpdated, setActiveLastUpdated] = useState(
    cachedActiveLastUpdated,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [askAiText, setAskAiText] = useState("");
  const [aiChat, setAiChat] = useState([]);

  // Stocks database for search autocomplete
  const INDIAN_STOCKS = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "INFY", name: "Infosys Limited" },
    { symbol: "SBIN", name: "State Bank of India" },
    { symbol: "HDFCBANK", name: "HDFC Bank Limited" },
    { symbol: "TATAMOTORS", name: "Tata Motors Limited" },
    { symbol: "ADANIENT", name: "Adani Enterprises" },
    { symbol: "ICICIBANK", name: "ICICI Bank Limited" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel Limited" },
    { symbol: "LT", name: "Larsen & Toubro Limited" },
  ];

  // ── Inject flash-animation CSS once ─────────────────────────────────────
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "stocksense-flash-css";
    styleTag.textContent = FLASH_STYLE;
    if (!document.getElementById("stocksense-flash-css")) {
      document.head.appendChild(styleTag);
    }
    return () => {
      const el = document.getElementById("stocksense-flash-css");
      if (el) el.remove();
    };
  }, []);

  // ── Helper: detect a price change and trigger a flash for 1.5 s ──────────
  const triggerFlash = useCallback((key, newPrice, oldPrice) => {
    if (oldPrice === undefined || newPrice === oldPrice) return;
    const dir = newPrice > oldPrice ? "up" : "down";
    setFlashMap((prev) => ({ ...prev, [key]: dir }));
    setTimeout(() => setFlashMap((prev) => ({ ...prev, [key]: null })), 1500);
  }, []);

  // ── Initial full dashboard fetch (shows spinner, sets all state) ──────────
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard/data/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setData(response.data);
      cachedDashboardData = response.data;
      // Seed the previous-prices ref so first live refresh can compare
      const d = response.data;
      prevPricesRef.current = {
        nifty50: parseFloat(d.summary?.nifty_50?.value?.replace(/,/g, "") || 0),
        sensex: parseFloat(d.summary?.sensex?.value?.replace(/,/g, "") || 0),
        bank_nifty: parseFloat(
          d.summary?.bank_nifty?.value?.replace(/,/g, "") || 0,
        ),
        ...(d.trending_stocks || []).reduce((acc, s) => {
          acc[s.symbol] = parseFloat(s.price?.replace(/,/g, "") || 0);
          return acc;
        }, {}),
      };
    } catch (err) {
      setError("Failed to fetch dashboard data. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Live refresh: silently merges /api/market/live/, top-gainers, and top-losers into existing state ───
  const fetchLiveData = useCallback(async (force = false) => {
    // Do NOT fetch if market is closed (unless forced on initial load)
    if (!force && !isNSEOpen()) {
      setMarketStatus({ is_open: false, label: "Market Closed" });
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      const [liveRes, gainersRes, losersRes, activeRes] =
        await Promise.allSettled([
          axios.get("http://127.0.0.1:8000/api/market/live/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/market/top-gainers/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/market/top-losers/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/market/top-active/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (liveRes.status === "fulfilled") {
        const live = liveRes.value.data;

        // ── Detect price changes and trigger flashes ──
        const prev = prevPricesRef.current;
        const newPrev = { ...prev };

        const checkFlash = (key, valueStr) => {
          const newPrice = parseFloat(valueStr?.replace(/,/g, "") || 0);
          triggerFlash(key, newPrice, prev[key]);
          newPrev[key] = newPrice;
        };

        if (live.indices) {
          checkFlash("nifty50", live.indices.nifty_50?.value);
          checkFlash("sensex", live.indices.sensex?.value);
          checkFlash("bank_nifty", live.indices.bank_nifty?.value);
        }
        (live.trending_stocks || []).forEach((s) =>
          checkFlash(s.symbol, s.price),
        );
        (live.watchlist || []).forEach((s) => checkFlash(s.symbol, s.price));
        prevPricesRef.current = newPrev;

        // ── Merge live data into the main `data` state (functional update) ──
        setData((prevVal) => {
          if (!prevVal) return prevVal;
          const updated = {
            ...prevVal,
            summary: live.summary
              ? {
                  ...prevVal.summary,
                  nifty_50: live.summary.nifty_50,
                  sensex: live.summary.sensex,
                  bank_nifty: live.summary.bank_nifty,
                  portfolio:
                    live.summary.portfolio ?? prevVal.summary.portfolio,
                  ai_mood: live.summary.ai_mood ?? prevVal.summary.ai_mood,
                  wallet: prevVal.summary.wallet, // wallet unchanged by live refresh
                }
              : prevVal.summary,
            market_overview: live.market_overview || prevVal.market_overview,
            trending_stocks: live.trending_stocks || prevVal.trending_stocks,
            watchlist: live.watchlist || prevVal.watchlist,
            fii_dii: live.fii_dii || prevVal.fii_dii,
            ai_insights: live.ai_insights || prevVal.ai_insights,
          };
          cachedDashboardData = updated;
          return updated;
        });

        // ── Update market status and last-refreshed timestamp ──
        if (live.market_status) {
          setMarketStatus(live.market_status);
        }
        setLastRefreshed(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      }

      if (gainersRes.status === "fulfilled") {
        const payload = gainersRes.value.data;
        if (payload && payload.success) {
          const list = payload.data?.top_gainers || [];
          setGainers(list);
          cachedGainers = list;
          setGainersIsLive(payload.is_live);
          cachedGainersIsLive = payload.is_live;
          setGainersLastUpdated(payload.last_updated || "");
          cachedGainersLastUpdated = payload.last_updated || "";
        } else {
          const list = Array.isArray(payload) ? payload : [];
          setGainers(list);
          cachedGainers = list;
        }
        setGainersLoading(false);
      }
      if (losersRes.status === "fulfilled") {
        const payload = losersRes.value.data;
        if (payload && payload.success) {
          const list = payload.data?.top_losers || [];
          setLosers(list);
          cachedLosers = list;
          setLosersIsLive(payload.is_live);
          cachedLosersIsLive = payload.is_live;
          setLosersLastUpdated(payload.last_updated || "");
          cachedLosersLastUpdated = payload.last_updated || "";
        } else {
          const list = Array.isArray(payload) ? payload : [];
          setLosers(list);
          cachedLosers = list;
        }
        setLosersLoading(false);
      }
      if (activeRes && activeRes.status === "fulfilled") {
        const payload = activeRes.value.data;
        if (payload && payload.success) {
          const list = payload.data?.top_active || [];
          setActive(list);
          cachedActive = list;
          setActiveIsLive(payload.is_live);
          cachedActiveIsLive = payload.is_live;
          setActiveLastUpdated(payload.last_updated || "");
          cachedActiveLastUpdated = payload.last_updated || "";
        } else {
          const list = Array.isArray(payload) ? payload : [];
          setActive(list);
          cachedActive = list;
        }
        setActiveLoading(false);
      }
    } catch (err) {
      // Silent failure — keep showing previous values, don't show error to user
      console.warn("[StockSense] Live refresh failed silently:", err?.message);
    }
  }, [triggerFlash]);

  const fetchTopGainers = async () => {
    if (cachedGainers.length === 0) setGainersLoading(true);
    setGainersError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/market/top-gainers/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = response.data;
      if (payload && payload.success) {
        const list = payload.data?.top_gainers || [];
        setGainers(list);
        cachedGainers = list;
        setGainersIsLive(payload.is_live);
        cachedGainersIsLive = payload.is_live;
        setGainersLastUpdated(payload.last_updated || "");
        cachedGainersLastUpdated = payload.last_updated || "";
      } else {
        const list = Array.isArray(payload) ? payload : [];
        setGainers(list);
        cachedGainers = list;
      }
    } catch (err) {
      setGainersError("Unable to load Top Gainers.");
    } finally {
      setGainersLoading(false);
    }
  };

  const fetchTopActive = async () => {
    if (cachedActive.length === 0) setActiveLoading(true);
    setActiveError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/market/top-active/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = response.data;
      if (payload && payload.success) {
        const list = payload.data?.top_active || [];
        setActive(list);
        cachedActive = list;
        setActiveIsLive(payload.is_live);
        cachedActiveIsLive = payload.is_live;
        setActiveLastUpdated(payload.last_updated || "");
        cachedActiveLastUpdated = payload.last_updated || "";
      } else {
        const list = Array.isArray(payload) ? payload : [];
        setActive(list);
        cachedActive = list;
      }
    } catch (err) {
      setActiveError("Unable to load Active Movers.");
    } finally {
      setActiveLoading(false);
    }
  };

  const fetchTopLosers = async () => {
    if (cachedLosers.length === 0) setLosersLoading(true);
    setLosersError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/market/top-losers/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const payload = response.data;
      if (payload && payload.success) {
        const list = payload.data?.top_losers || [];
        setLosers(list);
        cachedLosers = list;
        setLosersIsLive(payload.is_live);
        cachedLosersIsLive = payload.is_live;
        setLosersLastUpdated(payload.last_updated || "");
        cachedLosersLastUpdated = payload.last_updated || "";
      } else {
        const list = Array.isArray(payload) ? payload : [];
        setLosers(list);
        cachedLosers = list;
      }
    } catch (err) {
      setLosersError("Unable to load Top Losers.");
    } finally {
      setLosersLoading(false);
    }
  };

  // ── Mount effect: initial fetch + start polling intervals ─────────────────
  useEffect(() => {
    fetchDashboardData();
    fetchTopGainers();
    fetchTopLosers();
    fetchTopActive();

    // Live market data — poll every 12 seconds
    // fetchLiveData itself checks isNSEOpen() and skips if market is closed
    const liveInterval = setInterval(fetchLiveData, 12000);

    return () => {
      clearInterval(liveInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = INDIAN_STOCKS.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(filtered);
    }
  };

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!askAiText.trim()) return;
    const newChat = [...aiChat, { sender: "user", text: askAiText }];
    setAiChat(newChat);
    setAskAiText("");

    // Simulate AI response
    setTimeout(() => {
      setAiChat([
        ...newChat,
        {
          sender: "ai",
          text: `Analyzing ${askAiText}... RELIANCE, TCS and NIFTY 50 show bullish sentiment. Indicators suggest holding positions.`,
        },
      ]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#00E0A4] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(0,224,164,0.5)]"></div>
          <p className="text-slate-300 font-bold tracking-wider">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="bg-[#0B1118]/80 backdrop-blur-xl p-8 rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <h2 className="text-2xl font-bold text-white">
            Connection Error
          </h2>
          <p className="text-slate-400 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-[#00E0A4] to-[#00B37E] text-[#05070D] font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,224,164,0.4)] transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 pt-20 lg:pt-6 pb-24 px-4 lg:px-8 relative z-10">
      <div className="mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            StockSense India
          </h2>
          <p className="text-slate-400 text-sm font-semibold mt-1">
            Timings: 9:15 AM - 3:30 PM (IST)
            {lastRefreshed && (
              <span className="ml-2 text-slate-500 text-xs">
                • Updated {lastRefreshed}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: NIFTY 50 */}
        <div className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] premium-glass-card hover-lift-card hover-gradient group">
          <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
            NIFTY 50
          </p>
          <h3
            className={`text-xl font-bold text-white mt-2 ${flashMap["nifty50"] ? `flash-${flashMap["nifty50"]}` : ""}`}
          >
            {data.summary.nifty_50.value}
          </h3>
          <div
            className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.nifty_50.trend === "up" ? "text-[#00E0A4]" : "text-red-400"}`}
          >
            {data.summary.nifty_50.trend === "up" ? (
              <TrendingUp className="w-4 h-4 drop-shadow-[0_0_8px_rgba(0,224,164,0.5)]" />
            ) : (
              <TrendingDown className="w-4 h-4 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
            )}
            <span>
              {data.summary.nifty_50.change} (
              {data.summary.nifty_50.change_percent})
            </span>
          </div>
        </div>

        {/* Card 2: SENSEX */}
        <div className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] premium-glass-card hover-lift-card hover-gradient group">
          <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
            SENSEX
          </p>
          <h3
            className={`text-xl font-bold text-white mt-2 ${flashMap["sensex"] ? `flash-${flashMap["sensex"]}` : ""}`}
          >
            {data.summary.sensex.value}
          </h3>
          <div
            className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.sensex.trend === "up" ? "text-[#00E0A4]" : "text-red-400"}`}
          >
            {data.summary.sensex.trend === "up" ? (
              <TrendingUp className="w-4 h-4 drop-shadow-[0_0_8px_rgba(0,224,164,0.5)]" />
            ) : (
              <TrendingDown className="w-4 h-4 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
            )}
            <span>
              {data.summary.sensex.change} ({data.summary.sensex.change_percent}
              )
            </span>
          </div>
        </div>

        {/* Card 3: BANK NIFTY */}
        <div className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] premium-glass-card hover-lift-card hover-gradient group">
          <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
            BANK NIFTY
          </p>
          <h3
            className={`text-xl font-bold text-white mt-2 ${flashMap["bank_nifty"] ? `flash-${flashMap["bank_nifty"]}` : ""}`}
          >
            {data.summary.bank_nifty.value}
          </h3>
          <div
            className={`flex items-center gap-1 mt-1 font-bold text-xs ${data.summary.bank_nifty.trend === "up" ? "text-[#00E0A4]" : "text-red-400"}`}
          >
            {data.summary.bank_nifty.trend === "up" ? (
              <TrendingUp className="w-4 h-4 drop-shadow-[0_0_8px_rgba(0,224,164,0.5)]" />
            ) : (
              <TrendingDown className="w-4 h-4 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
            )}
            <span>
              {data.summary.bank_nifty.change} (
              {data.summary.bank_nifty.change_percent})
            </span>
          </div>
        </div>

        {/* Card 4: Portfolio Value */}
        <div className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] border border-white/5 hover:border-white/20 shadow-lg hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
            PORTFOLIO VALUE
          </p>
          <h3 className="text-xl font-bold text-white mt-2">
            ₹{data.summary.portfolio.current_value.toLocaleString("en-IN")}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-purple-400 font-bold">
            <TrendingUp className="w-4 h-4 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-xs">
              ₹{data.summary.portfolio.today_pl.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Card 5: Wallet Balance */}
        <div className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] premium-glass-card hover-lift-card hover-gradient group">
          <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
            PAPER WALLET
          </p>
          <h3 className="text-xl font-bold text-white mt-2">
            ₹{data.summary.wallet.current.toLocaleString("en-IN")}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-bold">
            Initial: ₹50,000
          </p>
        </div>
      </section>

      {/* 2. SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SECTION */}
        <div className="lg:col-span-9 space-y-8">
          {/* Market Overview Indices mini-cards */}
          <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card glow-market relative overflow-hidden">
            <div className="bg-radial-market"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-white">
                Market Overview
              </h3>
              <div className="flex items-center gap-2">
                {/* Market open/closed status badge */}
                {marketStatus.label && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      marketStatus.is_open
                        ? "text-[#00E0A4] bg-[#00E0A4]/10 border border-[#00E0A4]/20"
                        : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                    }`}
                  >
                    {marketStatus.is_open ? "● " : "○ "}
                    {marketStatus.label}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  IST Timings
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.market_overview.map((market, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/5 premium-glass-card rounded-[16px] hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-400">
                    {market.symbol}
                  </span>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="text-sm font-bold text-white">
                      ₹{market.value}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-bold ${market.trend === "up" ? "text-[#00E0A4]" : "text-red-400"}`}
                    >
                      {market.trend === "up" ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>{market.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Stocks Grid */}
          <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card">
            <h3 className="text-xl font-bold text-white mb-6">
              Trending Stocks
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.trending_stocks.map((stock, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/share/${stock.symbol}`)}
                  className="p-4 rounded-[16px] bg-white/5 premium-glass-card hover-lift-card glow-trending flex flex-col justify-between cursor-pointer group relative"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                    className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors z-10"
                  >
                    <Star className={`w-4 h-4 ${watchlist.includes(stock.symbol) ? 'fill-[#00E0A4] text-[#00E0A4]' : 'text-slate-500 hover:text-white'}`} />
                  </button>
                  <div className="flex items-center gap-3 pr-8">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${stock.trend === "up" ? "bg-[#00E0A4]/10 text-[#00E0A4]" : "bg-red-500/10 text-red-400"}`}
                    >
                      {stock.logo}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white flex items-center gap-2">
                        {stock.symbol}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate w-24">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline mt-4">
                    {/* Flash animation applied to price span on change */}
                    <span
                      className={`text-sm font-bold text-white ${flashMap[stock.symbol] ? `flash-${flashMap[stock.symbol]}` : ""}`}
                    >
                      ₹{stock.price}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-bold ${stock.trend === "up" ? "text-[#00E0A4]" : "text-red-400"}`}
                    >
                      {stock.trend === "up" ? (
                        <TrendingUp className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
                      )}
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
            <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-[#00E0A4] tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E0A4] shadow-[0_0_8px_rgba(0,224,164,0.8)]"></span>{" "}
                  TOP GAINERS
                </h4>
                {gainersIsLive ? (
                  <span className="text-[9px] font-bold text-[#00E0A4] bg-[#00E0A4]/10 border border-[#00E0A4]/20 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Closing Data
                    {gainersLastUpdated ? ` • ${gainersLastUpdated}` : ""}
                  </span>
                )}
              </div>
              {gainersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-12 bg-slate-100 rounded-xl animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : gainersError ? (
                <p className="text-sm text-slate-400 font-semibold text-center py-4">
                  {gainersError}
                </p>
              ) : gainers.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold text-center py-4">
                  No market data available.
                </p>
              ) : (
                <div className="space-y-3">
                  {gainers.map((stock, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/share/${stock.symbol}`)}
                      className="flex justify-between items-center p-3 bg-[#00E0A4]/5 rounded-xl border border-[#00E0A4]/20 hover:shadow-[0_4px_15px_rgba(0,224,164,0.1)] transition-all duration-300 cursor-pointer hover:bg-[#00E0A4]/10 hover:border-[#00E0A4]/40 relative group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                          className="p-1 hover:bg-[#00E0A4]/20 rounded-full transition-colors"
                        >
                          <Star className={`w-4 h-4 ${watchlist.includes(stock.symbol) ? 'fill-[#00E0A4] text-[#00E0A4]' : 'text-slate-500 hover:text-white'}`} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate group-hover:text-[#00E0A4] transition-colors">
                            {stock.symbol}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0 ml-2">
                        <p className="text-xs text-slate-300 font-bold">
                          ₹{stock.price}
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5 text-[#00E0A4]">
                          <TrendingUp className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                          <span className="text-xs font-bold">
                            +{stock.change_percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Losers */}
            <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-red-500 tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span> TOP
                  LOSERS
                </h4>
                {losersIsLive ? (
                  <span className="text-[9px] font-bold text-[#00E0A4] bg-[#00E0A4]/10 border border-[#00E0A4]/20 px-2 py-0.5 rounded-full">
                    Live
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Closing Data
                    {losersLastUpdated ? ` • ${losersLastUpdated}` : ""}
                  </span>
                )}
              </div>
              {losersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-12 bg-slate-100 rounded-xl animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : losersError ? (
                <p className="text-sm text-slate-400 font-semibold text-center py-4">
                  {losersError}
                </p>
              ) : losers.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold text-center py-4">
                  No market data available.
                </p>
              ) : (
                <div className="space-y-3">
                  {losers.map((stock, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/share/${stock.symbol}`)}
                      className="flex justify-between items-center p-3 bg-red-500/5 rounded-xl border border-red-500/20 hover:shadow-[0_4px_15px_rgba(239,68,68,0.1)] transition-all duration-300 cursor-pointer hover:bg-red-500/10 hover:border-red-500/40 relative group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                          className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                          <Star className={`w-4 h-4 ${watchlist.includes(stock.symbol) ? 'fill-[#00E0A4] text-[#00E0A4]' : 'text-slate-500 hover:text-white'}`} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate group-hover:text-red-400 transition-colors">
                            {stock.symbol}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0 ml-2">
                        <p className="text-xs text-slate-300 font-bold">
                          ₹{stock.price}
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5 text-red-500">
                          <TrendingDown className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                          <span className="text-xs font-bold">
                            {stock.change_percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FII DII Activity (Full Width) */}
          <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card mt-8">
            <h3 className="text-xl font-bold text-white mb-6">
              FII / DII Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FII Activity */}
              <div className="space-y-3 p-4 bg-white/5 rounded-[16px] premium-glass-card">
                <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Foreign Institutional Investors (FII)
                </h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Buy Value</span>
                  <span className="font-bold text-white">
                    {data.fii_dii?.fii_buy || "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Sell Value</span>
                  <span className="font-bold text-white">
                    {data.fii_dii?.fii_sell || "Loading..."}
                  </span>
                </div>
              </div>

              {/* DII Activity */}
              <div className="space-y-3 p-4 bg-white/5 rounded-[16px] premium-glass-card">
                <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Domestic Institutional Investors (DII)
                </h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Buy Value</span>
                  <span className="font-bold text-white">
                    {data.fii_dii?.dii_buy || "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold">Sell Value</span>
                  <span className="font-bold text-white">
                    {data.fii_dii?.dii_sell || "Loading..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Flow */}
            <div className="mt-4 flex justify-between items-center p-4 px-6 bg-slate-100/50 rounded-xl border border-slate-100">
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Overall Net Flow
              </span>
              <span
                className={`text-lg font-bold ${data.fii_dii?.net_flow?.startsWith("-") ? "text-red-500" : "text-emerald-600"}`}
              >
                {data.fii_dii?.net_flow || "Loading..."}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-3 space-y-8">
          {/* Watchlist */}
          <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card relative overflow-hidden">
            <div className="bg-radial-watchlist"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-bold text-white">Watchlist</h3>
              <span className="text-[10px] font-bold tracking-widest text-[#05070D] bg-gradient-to-r from-[#00E0A4] to-[#00B37E] px-4 py-1.5 rounded-full hover:shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:-translate-y-0.5 cursor-pointer uppercase transition-all duration-300 premium-btn">
                + Add
              </span>
            </div>
            <div className="space-y-4 relative z-10">
              {watchlist.length === 0 ? (
                <div className="watchlist-empty-glow bg-white/5 rounded-[20px] border border-white/5 p-8 flex items-center justify-center">
                  <p className="text-sm text-slate-500 font-semibold text-center">
                    No stocks in watchlist.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {watchlist.map((symbol, idx) => {
                    const stock = watchlistData[symbol] || {
                      symbol,
                      name: "Loading...",
                      price: "---",
                      change: "0.0%",
                      trend: "up"
                    };
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(`/share/${symbol}`)}
                        className="bg-[#0B1118]/60 backdrop-blur-md p-5 rounded-[20px] border border-white/5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,224,164,0.1)] hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer relative group duration-300"
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(symbol); }}
                          className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Star className="w-4 h-4 fill-[#00E0A4] text-[#00E0A4]" />
                        </button>
                        <p className="text-xs font-bold text-slate-400 tracking-wider group-hover:text-slate-300 transition-colors">
                          {symbol}
                        </p>
                        <h3 className={`text-xl font-bold text-white mt-2 ${flashMap[symbol] ? `flash-${flashMap[symbol]}` : ""}`}>
                          {stock.price !== "---" ? `₹${stock.price}` : "---"}
                        </h3>
                        <div className={`flex items-center gap-1 mt-1 font-bold text-xs ${stock.trend === 'up' ? 'text-[#00E0A4]' : 'text-red-400'}`}>
                          {stock.trend === 'up' && stock.price !== "---" ? (
                            <TrendingUp className="w-4 h-4 drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
                          ) : stock.price !== "---" ? (
                            <TrendingDown className="w-4 h-4 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]" />
                          ) : null}
                          <span>{stock.change}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sector Performance */}
          <div className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-[24px] premium-glass-card">
            <h3 className="text-xl font-bold text-white mb-6">
              Sector Performance
            </h3>
            <div className="space-y-4">
              {data.sector_performance.map((sector, idx) => (
                <div key={idx} className="space-y-1 group">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400 group-hover:text-slate-300 transition-colors">{sector.sector}</span>
                    <span
                      className={
                        sector.change.startsWith("+")
                          ? "text-[#00E0A4]"
                          : "text-red-400"
                      }
                    >
                      {sector.change}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sector.change.startsWith("+") ? "bg-gradient-to-r from-[#00E0A4]/80 to-[#00E0A4] shadow-[0_0_10px_rgba(0,224,164,0.8)]" : "bg-gradient-to-r from-red-500/80 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`}
                      style={{
                        width: `${Math.min(100, Math.abs(parseFloat(sector.change)) * 20)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Paper Trades */}
      <div className="bg-[#0B1118]/80 backdrop-blur-xl rounded-[24px] premium-glass-card overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">
            Recent Paper Trades
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  STOCK
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  TYPE
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  QTY
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  PRICE
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  P/L
                </th>
                <th className="px-6 py-4 text-xs font-bold tracking-wider">
                  TIMESTAMP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recent_trades && data.recent_trades.length > 0 ? (
                data.recent_trades.map((trade, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors duration-200 cursor-default">
                    <td className="px-6 py-4 font-bold text-sm text-white">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${trade.type === "BUY" ? "bg-[#00E0A4]/10 text-[#00E0A4] border border-[#00E0A4]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-bold">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 font-bold">
                      ₹{trade.price}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold ${trade.pl.startsWith("+") ? "text-[#00E0A4]" : "text-red-400"}`}
                    >
                      ₹{trade.pl}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold">
                      {trade.timestamp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-sm font-bold text-slate-500"
                  >
                    No records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RIGHT FLOATING CHAT WIDGET (FAB for AI chat popup) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {aiChat.length > 0 && (
          <div className="w-80 bg-[#0B1118]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-4 overflow-hidden flex flex-col max-h-96">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 font-bold text-sm flex items-center gap-2 border-b border-white/10">
              <Sparkles className="w-4 h-4 fill-white/50" />
              Ask StockSense AI
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-64 custom-scrollbar bg-transparent">
              {aiChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs max-w-[85%] font-medium ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white self-end ml-auto"
                      : "bg-white/10 text-slate-300 border border-white/5"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form
              onSubmit={handleAskAI}
              className="p-3 border-t border-white/10 flex gap-2 bg-black/20"
            >
              <input
                type="text"
                value={askAiText}
                onChange={(e) => setAskAiText(e.target.value)}
                placeholder="Ask stock queries..."
                className="flex-1 text-xs bg-white/5 text-white border border-white/10 rounded-xl px-3 py-2 outline-none focus:border-purple-500 placeholder:text-slate-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => {
            if (aiChat.length === 0) {
              setAiChat([
                {
                  sender: "ai",
                  text: "Hello! I am your StockSense AI assistant. Ask me anything about Indian stocks!",
                },
              ]);
            } else {
              setAiChat([]);
            }
          }}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center ai-fab-btn z-50 border border-white/10"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      </div>
    </main>
  );
};

export default Dashboard;
