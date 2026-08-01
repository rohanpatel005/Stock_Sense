import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const PortfolioFilters = ({ filters, setFilters }) => {
  
  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', filterType: 'ALL', sort: 'value_desc' });
  };

  const hasActiveFilters = filters.search || filters.filterType !== 'ALL' || filters.sort !== 'value_desc';

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between items-start lg:items-center">
      
      {/* Search Input */}
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by symbol or company..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
        />
      </div>

      {/* Filter Chips & Sort */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'ALL' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.filterType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'PROFIT' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.filterType === 'PROFIT' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            Profit
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, filterType: 'LOSS' }))} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.filterType === 'LOSS' ? 'bg-red-500 text-white shadow-sm' : 'text-red-600 hover:bg-red-50'}`}
          >
            Loss
          </button>
        </div>

        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 mr-2" />
          <select 
            value={filters.sort}
            onChange={handleSortChange}
            className="bg-transparent py-1.5 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="value_desc">Highest Value</option>
            <option value="value_asc">Lowest Value</option>
            <option value="return_desc">Highest Return %</option>
            <option value="return_asc">Lowest Return %</option>
            <option value="pl_desc">Highest P&L</option>
            <option value="pl_asc">Lowest P&L</option>
          </select>
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 flex items-center justify-center"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};

export default PortfolioFilters;
