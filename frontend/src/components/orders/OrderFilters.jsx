import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 w-full xl:w-auto">
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button 
            onClick={() => handleTypeClick('')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!filters.type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Types
          </button>
          <button 
            onClick={() => handleTypeClick('BUY')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.type === 'BUY' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            BUY
          </button>
          <button 
            onClick={() => handleTypeClick('SELL')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.type === 'SELL' ? 'bg-red-500 text-white shadow-sm' : 'text-red-600 hover:bg-red-50'}`}
          >
            SELL
          </button>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button 
            onClick={() => handleStatusClick('SUCCESS')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.status === 'SUCCESS' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            SUCCESS
          </button>
          <button 
            onClick={() => handleStatusClick('PENDING')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.status === 'PENDING' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 hover:bg-amber-50'}`}
          >
            PENDING
          </button>
          <button 
            onClick={() => handleStatusClick('FAILED')} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filters.status === 'FAILED' ? 'bg-red-500 text-white shadow-sm' : 'text-red-600 hover:bg-red-50'}`}
          >
            FAILED
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <div className="relative flex-1 xl:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search symbol..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
        
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0 flex items-center justify-center"
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
};

export default OrderFilters;
