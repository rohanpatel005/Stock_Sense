import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderFilters = ({ filters, setFilters }) => {
  const [searchInput, setSearchInput] = useState(filters.symbol || '');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(prev => ({ ...prev, symbol: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, setFilters]);

  const handleStatusClick = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status,
      page: 1
    }));
  };

  const handleTypeClick = (type) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type === type ? '' : type,
      page: 1
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ status: '', type: '', symbol: '', page: 1 });
  };

  const hasActiveFilters = filters.status || filters.type || filters.symbol;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center relative"
    >
      {/* Soft emerald radial light behind the search area */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#00E0A4]/5 blur-[60px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 w-full xl:w-auto">
        <div className="flex bg-[#0A0D14]/80 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <button 
            onClick={() => handleTypeClick('')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${!filters.type ? 'bg-[#2A313C]/80 text-white shadow-sm shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            All Types
          </button>
          <button 
            onClick={() => handleTypeClick('BUY')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.type === 'BUY' ? 'bg-[#00E0A4]/20 text-[#00E0A4] shadow-[0_0_15px_rgba(0,224,164,0.15)]' : 'text-slate-400 hover:text-[#00E0A4] hover:bg-[#00E0A4]/10'}`}
          >
            BUY
          </button>
          <button 
            onClick={() => handleTypeClick('SELL')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.type === 'SELL' ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            SELL
          </button>
        </div>

        <div className="flex bg-[#0A0D14]/80 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <button 
            onClick={() => handleStatusClick('SUCCESS')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.status === 'SUCCESS' ? 'bg-[#00E0A4]/20 text-[#00E0A4] shadow-[0_0_15px_rgba(0,224,164,0.15)]' : 'text-slate-400 hover:text-[#00E0A4] hover:bg-[#00E0A4]/10'}`}
          >
            SUCCESS
          </button>
          <button 
            onClick={() => handleStatusClick('PENDING')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
          >
            PENDING
          </button>
          <button 
            onClick={() => handleStatusClick('FAILED')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.status === 'FAILED' ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            FAILED
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="relative flex-1 xl:w-64 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00E0A4] transition-colors" />
          <input 
            type="text"
            placeholder="Search symbol..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0A0D14]/80 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00E0A4]/50 focus:border-[#00E0A4]/50 placeholder-slate-500 transition-all shadow-inner"
          />
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0 flex items-center justify-center"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

    </motion.div>
  );
};

export default OrderFilters;
