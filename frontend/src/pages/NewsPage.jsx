import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

import NewsCard from '../components/News/NewsCard';
import FeaturedNews from '../components/News/FeaturedNews';

const API_BASE_URL = 'http://localhost:8000/api/market';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, you might want to handle auth tokens properly
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/news/latest/`, { headers });
      setNews(response.data);
    } catch (err) {
      console.error('Failed to fetch news', err);
      setError('Unable to fetch news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const featuredArticle = news.length > 0 ? news[0] : null;
  const gridArticles = news.slice(1);

  return (
    <div className="min-h-screen bg-transparent font-sans pb-20 lg:pb-0 relative z-10">
      {/* Header Section */}
      <div className="bg-[#0B1118]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Market News</h1>
            <p className="text-sm text-slate-400 font-medium">Stay updated with the latest financial and stock market news.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNews}
              className="p-2.5 bg-white/5 text-slate-400 hover:text-[#00E0A4] hover:bg-[#00E0A4]/10 border border-white/10 hover:border-[#00E0A4]/30 rounded-full transition-all shadow-sm hover:shadow-[0_0_15px_rgba(0,224,164,0.2)]"
              title="Refresh News"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden lg:block text-xs font-semibold text-[#00E0A4] bg-[#00E0A4]/10 px-3 py-2 rounded-full border border-[#00E0A4]/20 shadow-[0_0_10px_rgba(0,224,164,0.1)]">
              Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="px-6 py-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-8">
          
          {/* Left Column (News Feed) */}
          <div className="flex-1 space-y-8">
            
            {loading ? (
              // Loading Skeleton
              <div className="space-y-8 animate-pulse">
                <div className="bg-white/5 border border-white/10 rounded-3xl h-[400px] w-full premium-glass-card" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-[#0B1118]/60 premium-glass-card rounded-[24px] h-[350px] overflow-hidden">
                      <div className="bg-white/10 h-[180px]" />
                      <div className="p-4 space-y-3">
                        <div className="bg-white/10 h-4 w-1/3 rounded" />
                        <div className="bg-white/10 h-6 w-full rounded" />
                        <div className="bg-white/10 h-6 w-5/6 rounded" />
                        <div className="bg-white/10 h-4 w-full mt-4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              // Error State
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0B1118]/80 premium-glass-card rounded-[24px]">
                <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong.</h3>
                <p className="text-slate-400 mb-6 font-medium">{error}</p>
                <button 
                  onClick={fetchNews}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  Retry
                </button>
              </div>
            ) : news.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0B1118]/80 premium-glass-card rounded-[24px]">
                <div className="w-48 h-48 mb-6 opacity-50">
                  {/* Simple SVG Illustration */}
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="40" width="140" height="120" rx="12" fill="#1e293b" />
                    <rect x="50" y="70" width="100" height="16" rx="4" fill="#334155" />
                    <rect x="50" y="100" width="80" height="12" rx="4" fill="#334155" />
                    <rect x="50" y="120" width="60" height="12" rx="4" fill="#334155" />
                    <circle cx="140" cy="120" r="12" fill="#475569" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No news available.</h3>
                <p className="text-slate-400 mb-6 font-medium">Check back later for the latest updates.</p>
              </div>
            ) : (
              // Content
              <AnimatePresence mode="wait">
                <motion.div
                  key="news-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Featured Article */}
                  {featuredArticle && (
                    <FeaturedNews 
                      article={featuredArticle} 
                    />
                  )}

                  {/* Grid Articles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {gridArticles.map((article, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <NewsCard 
                          article={article}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
