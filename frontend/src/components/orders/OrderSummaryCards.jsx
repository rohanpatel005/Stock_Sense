import React from 'react';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Orders',
      value: summary.total_orders,
      icon: Activity,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
    },
    {
      title: 'Successful Orders',
      value: summary.successful_orders,
      icon: CheckCircle,
      iconColor: 'text-[#00E0A4]',
      iconBg: 'bg-[#00E0A4]/10',
    },
    {
      title: 'Pending Orders',
      value: summary.pending_orders,
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    {
      title: 'Failed Orders',
      value: summary.failed_orders,
      icon: AlertCircle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
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
              <h3 className="text-2xl font-black text-white">{card.value}</h3>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default OrderSummaryCards;
