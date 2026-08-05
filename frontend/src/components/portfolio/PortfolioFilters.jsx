import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioFilters = ({ filters, setFilters }) => {
  
  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', filterType: 'ALL', sort: 'value_desc' });
  };

  const hasActiveFilters = filters.search || filters.filterType !== 'ALL' || filters.sort !== 'value_desc';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-start lg:items-center relative"
    >
      {/* Soft emerald radial light behind the search area */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#00E0A4]/5 blur-[60px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Search Input */}
      <div className="relative flex-1 w-full max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#00E0A4] transition-colors" />
        <input 
          type="text"
          placeholder="Search by symbol or company..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-12 pr-4 py-3 bg-[#0A0D14]/80 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#00E0A4]/50 focus:border-[#00E0A4]/50 placeholder-slate-500 transition-all shadow-inner"
        />
      </div>

      {/* Filter Chips & Sort */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex bg-[#0A0D14]/80 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'ALL' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.filterType === 'ALL' ? 'bg-[#2A313C]/80 text-white shadow-sm shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'PROFIT' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.filterType === 'PROFIT' ? 'bg-[#00E0A4]/20 text-[#00E0A4] shadow-[0_0_15px_rgba(0,224,164,0.15)]' : 'text-slate-400 hover:text-[#00E0A4] hover:bg-[#00E0A4]/10'}`}
          >
            Profit
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'LOSS' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${filters.filterType === 'LOSS' ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            Loss
          </button>
        </div>

        <div className="relative flex items-center bg-[#0A0D14]/80 border border-white/10 rounded-xl px-3 py-1 group hover:border-white/20 transition-colors">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2 group-hover:text-purple-400 transition-colors" />
          <select 
            value={filters.sort}
            onChange={handleSortChange}
            className="bg-transparent py-1.5 text-sm font-bold text-slate-300 focus:outline-none cursor-pointer appearance-none pr-4 hover:text-white transition-colors"
          >
            <option className="bg-[#0B1118]" value="value_desc">Highest Value</option>
            <option className="bg-[#0B1118]" value="value_asc">Lowest Value</option>
            <option className="bg-[#0B1118]" value="return_desc">Highest Return %</option>
            <option className="bg-[#0B1118]" value="return_asc">Lowest Return %</option>
            <option className="bg-[#0B1118]" value="pl_desc">Highest P&L</option>
            <option className="bg-[#0B1118]" value="pl_asc">Lowest P&L</option>
          </select>
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0 flex items-center justify-center"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default PortfolioFilters;
