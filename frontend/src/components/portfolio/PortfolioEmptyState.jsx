import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioEmptyState = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] py-20 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#00E0A4]/5 to-transparent opacity-50 pointer-events-none"></div>
      
      <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,224,164,0.1)]">
        <Briefcase className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-2xl font-black text-white tracking-tight">Your portfolio is empty.</h3>
      <p className="text-slate-400 font-medium mt-2 max-w-sm mb-8">
        Start paper trading to build your investment portfolio and track your returns in real-time.
      </p>
      <button 
        onClick={() => navigate('/market')}
        className="px-6 py-3 bg-[#00E0A4] text-[#05070D] rounded-xl font-bold hover:bg-[#00E0A4]/90 transition-all shadow-[0_0_20px_rgba(0,224,164,0.3)] hover:shadow-[0_0_30px_rgba(0,224,164,0.5)] hover:-translate-y-1"
      >
        Explore Market
      </button>
    </motion.div>
  );
};

export default PortfolioEmptyState;
