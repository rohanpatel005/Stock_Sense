import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { motion } from 'framer-motion';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const { watchlist, watchlistData, toggleWatchlist, fetchWatchlist } = useWatchlist();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  useEffect(() => {
    if (watchlist.length > 0 && Object.keys(watchlistData).length === 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [watchlist, watchlistData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
  };

  return (
    <>
      <main className="flex-1 pt-20 lg:pt-6 pb-24 px-4 lg:px-8 max-w-7xl mx-auto w-full space-y-6 relative z-10">
        
        {/* Soft emerald radial lighting behind header */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#00E0A4]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Watchlist</h1>
            <p className="text-slate-400 font-semibold mt-1">Track your favorite stocks.</p>
          </div>
          <div className="bg-[#0B1118]/80 backdrop-blur-md border border-[#00E0A4]/30 text-[#00E0A4] shadow-[0_0_15px_rgba(0,224,164,0.15)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap self-start sm:self-auto">
            <Star className="w-5 h-5 fill-current drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]" />
            {watchlist.length} Stocks
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-32 bg-white/5 border border-white/10 rounded-3xl animate-pulse backdrop-blur-xl"></div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B1118]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-12 text-center flex flex-col items-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#00E0A4]/5 to-transparent opacity-50 pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,224,164,0.1)]">
              <Star className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">Your watchlist is empty</h3>
            <p className="text-slate-400 font-medium mb-6 max-w-sm text-center">
              Keep track of stocks you're interested in by tapping the star icon on any stock card.
            </p>
            <button 
              onClick={() => navigate('/market')}
              className="px-6 py-3 bg-[#00E0A4] text-[#05070D] font-bold rounded-xl hover:bg-[#00E0A4]/90 transition-all shadow-[0_0_20px_rgba(0,224,164,0.3)] hover:shadow-[0_0_30px_rgba(0,224,164,0.5)] hover:-translate-y-1"
            >
              Explore Stocks
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative"
          >
            {/* Ambient lighting behind cards */}
            <div className="absolute inset-0 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
            
            {watchlist.map((symbol, idx) => {
              const stock = watchlistData[symbol] || {
                symbol,
                name: "Loading...",
                price: "---",
                change: "0.0%",
                trend: "up"
              };
              
              const isUp = stock.trend === 'up';

              return (
              <motion.div 
                variants={itemVariants}
                key={idx}
                onClick={() => navigate(`/share/${encodeURIComponent(stock.symbol)}`)}
                className="bg-[#0B1118]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 hover:border-[#00E0A4]/35 hover:shadow-[0_0_0_1px_rgba(0,224,164,0.15),0_10px_30px_rgba(0,224,164,0.08)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group relative text-left w-full flex flex-col justify-between overflow-hidden"
              >
                {/* Very subtle glow inside the card on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#00E0A4]/0 to-[#00E0A4]/0 group-hover:to-[#00E0A4]/[0.02] transition-colors pointer-events-none"></div>

                <button 
                  onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10 group/star"
                  title="Remove from watchlist"
                >
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 transition-transform duration-300 group-hover/star:scale-110 group-hover/star:rotate-12 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                </button>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg text-white shadow-inner group-hover:shadow-[0_0_15px_rgba(0,224,164,0.2)] transition-shadow">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-[#00E0A4] transition-colors">{stock.symbol}</h3>
                    <p className="text-xs text-slate-400 font-semibold">{stock.name}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between relative z-10">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Current Price</p>
                    <p className="text-2xl font-black text-white">₹{stock.price}</p>
                  </div>
                  <div className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all duration-300 ${isUp ? 'bg-[#00E0A4]/10 border-[#00E0A4]/30 text-[#00E0A4] shadow-[0_0_10px_rgba(0,224,164,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}>
                    {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stock.change}
                  </div>
                </div>
              </motion.div>
            )})}
          </motion.div>
        )}
      </main>
    </>
  );
};

export default WatchlistPage;
