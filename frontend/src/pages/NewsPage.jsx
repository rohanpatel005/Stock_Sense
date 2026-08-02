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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 lg:pb-0">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market News</h1>
            <p className="text-sm text-slate-500 font-medium">Stay updated with the latest financial and stock market news.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNews}
              className="p-2.5 bg-slate-50 text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 border border-slate-200 rounded-xl transition-all shadow-sm"
              title="Refresh News"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden lg:block text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
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
                <div className="bg-slate-200 rounded-3xl h-[400px] w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-2xl h-[350px] border border-slate-100 overflow-hidden">
                      <div className="bg-slate-200 h-[180px]" />
                      <div className="p-4 space-y-3">
                        <div className="bg-slate-200 h-4 w-1/3 rounded" />
                        <div className="bg-slate-200 h-6 w-full rounded" />
                        <div className="bg-slate-200 h-6 w-5/6 rounded" />
                        <div className="bg-slate-200 h-4 w-full mt-4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              // Error State
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong.</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button 
                  onClick={fetchNews}
                  className="px-6 py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-md"
                >
                  Retry
                </button>
              </div>
            ) : news.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-48 h-48 mb-6 opacity-80">
                  {/* Simple SVG Illustration */}
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="40" width="140" height="120" rx="12" fill="#E2E8F0" />
                    <rect x="50" y="70" width="100" height="16" rx="4" fill="#CBD5E1" />
                    <rect x="50" y="100" width="80" height="12" rx="4" fill="#CBD5E1" />
                    <rect x="50" y="120" width="60" height="12" rx="4" fill="#CBD5E1" />
                    <circle cx="140" cy="120" r="12" fill="#94A3B8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No news available.</h3>
                <p className="text-slate-500 mb-6">Check back later for the latest updates.</p>
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
