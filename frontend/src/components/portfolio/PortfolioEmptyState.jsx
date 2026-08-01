import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const PortfolioEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Briefcase className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your portfolio is empty.</h3>
      <p className="text-slate-500 font-medium mt-2 max-w-sm mb-8">
        Start paper trading to build your investment portfolio and track your returns in real-time.
      </p>
      <button 
        onClick={() => navigate('/market')}
        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
      >
        Explore Market
      </button>
    </div>
  );
};

export default PortfolioEmptyState;
