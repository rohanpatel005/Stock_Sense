import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, AlertCircle, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAnalystDrawer = ({ isOpen, onClose, symbol, companyName, livePrice }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && symbol && !analysis && !loading) {
      fetchAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, symbol]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/share/ai-analysis/',
        { symbol },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error(err);
      setError('Unable to generate AI analysis right now.');
    } finally {
      setLoading(false);
    }
  };

  // Split markdown by sections (H1 headers) to render as separate cards
  const renderMarkdownSections = (markdown) => {
    if (!markdown) return null;
    
    // Split by lines starting with exactly "# " (or "\n# ")
    // This regex splits on lines that start with "# "
    const sections = markdown.split(/\n(?=# )/);
    
    return sections.map((section, idx) => {
      if (!section.trim()) return null;
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          key={idx} 
          className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 shadow-lg mb-4 hover:bg-white/[0.04] transition-colors"
        >
          <div className="prose prose-invert prose-sm max-w-none
            prose-h1:text-lg prose-h1:font-bold prose-h1:text-[#00E0A4] prose-h1:mb-3 prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-2 prose-h1:mt-0
            prose-h2:text-sm prose-h2:text-slate-300 prose-h2:mt-4 prose-h2:mb-2
            prose-p:text-slate-400 prose-p:leading-relaxed prose-p:mb-3 last:prose-p:mb-0
            prose-ul:my-2 prose-li:text-slate-400 prose-li:my-0.5
            prose-strong:text-slate-200"
          >
            <ReactMarkdown>{section}</ReactMarkdown>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[450px] bg-[#0A0D14] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-b from-[#00E0A4]/10 to-transparent flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E0A4] to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,224,164,0.3)]">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">AI Stock Analyst</h2>
                </div>
                
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Stock</p>
                  <div className="flex items-end gap-3">
                    <div>
                      <h3 className="text-white font-bold text-base line-clamp-1">{companyName}</h3>
                      <p className="text-sm font-semibold text-slate-400">{symbol}</p>
                    </div>
                    {livePrice && (
                      <div className="ml-auto text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Live Price</p>
                        <p className="text-[#00E0A4] font-bold font-mono">₹{livePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {loading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="w-6 h-6 border-2 border-[#00E0A4] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-slate-400 animate-pulse">Running advanced AI analysis...</span>
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 animate-pulse">
                      <div className="h-5 w-1/3 bg-white/10 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-white/5 rounded"></div>
                        <div className="h-3 w-5/6 bg-white/5 rounded"></div>
                        <div className="h-3 w-4/6 bg-white/5 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3 opacity-80" />
                  <p className="text-red-400 font-semibold text-sm">{error}</p>
                  <button 
                    onClick={fetchAnalysis}
                    className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && analysis && (
                <div className="pb-8">
                  {renderMarkdownSections(analysis)}
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIAnalystDrawer;
