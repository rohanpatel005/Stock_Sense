import { Briefcase, IndianRupee, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const isProfit = summary.overall_profit_loss >= 0;
  
  const cards = [
    {
      title: 'Current Value',
      value: `₹${parseFloat(summary.current_portfolio_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: Briefcase,
      iconColor: 'text-[#00E0A4]',
      iconBg: 'bg-[#00E0A4]/10',
    },
    {
      title: 'Available Cash',
      value: `₹${parseFloat(summary.available_cash).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: IndianRupee,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
    },
    {
      title: 'Invested Amount',
      value: `₹${parseFloat(summary.invested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: PieChart,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      title: 'Overall P&L',
      value: `${isProfit ? '+' : ''}₹${parseFloat(summary.overall_profit_loss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subValue: `${isProfit ? '+' : ''}${parseFloat(summary.total_return_percentage).toFixed(2)}%`,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit ? 'text-[#00E0A4]' : 'text-red-400',
      iconBg: isProfit ? 'bg-[#00E0A4]/10' : 'bg-red-500/10',
      valueColor: isProfit ? 'text-[#00E0A4]' : 'text-red-400',
    },
  ];

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative"
    >
      {/* Subtle ambient glow behind the summary cards */}
      <div className="absolute inset-0 bg-[#00E0A4]/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
      
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div 
            variants={itemVariants}
            key={idx} 
            className="bg-[#0B1118]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#00E0A4]/35 hover:shadow-[0_0_0_1px_rgba(0,224,164,0.15),0_10px_30px_rgba(0,224,164,0.08)] group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <Icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-slate-400 font-medium text-xs tracking-wide uppercase mb-1">{card.title}</p>
              <h3 className={`text-xl xl:text-2xl font-black ${card.valueColor || 'text-white'} truncate max-w-[120px] xl:max-w-[150px]`}>
                {card.value}
              </h3>
              {card.subValue && (
                <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${card.valueColor}`}>
                  <span className={`inline-block px-1.5 py-0.5 rounded-md ${card.iconBg}`}>{card.subValue}</span>
                  <span className="text-slate-500 font-medium ml-1">All Time</span>
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PortfolioSummaryCards;
