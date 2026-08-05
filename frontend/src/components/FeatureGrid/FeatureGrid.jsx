import React from 'react';
import { LineChart, FlaskConical, Zap, Sparkles, ArrowUpRight, Cpu, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureGrid = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 dark-canvas relative overflow-hidden" id="features">
      {/* Subtle Glow Accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Institutional-Grade Infrastructure</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Precision Intelligence for Modern Investors
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Our multi-layered AI ecosystem delivers institutional-level analytics, zero-risk simulation, and instant market insights for Indian equities.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: AI Stock Research (2 Cols) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 dark-surface-card p-8 sm:p-10 rounded-2xl flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <LineChart className="w-6 h-6" />
                </div>
                <span className="badge-emerald font-mono">
                  5,000+ STOCKS COVERED
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-3">
                AI Stock Research & Fundamental Analysis
              </h3>
              <p className="text-gray-400 text-base max-w-lg mb-8 leading-relaxed">
                Deep-dive into NSE & BSE equities with automated financial models, balance sheet health scores, and neural sentiment breakdowns calculated in milliseconds.
              </p>
            </div>

            {/* Visual Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <div className="text-xs text-gray-400 font-medium mb-1">FEED LATENCY</div>
                <div className="text-xl font-bold font-mono text-emerald-400">~12ms</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <div className="text-xs text-gray-400 font-medium mb-1">METRICS PARSED</div>
                <div className="text-xl font-bold font-mono text-white">150+ / Stock</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-400 font-medium mb-1">UPDATE RATE</div>
                <div className="text-xl font-bold font-mono text-teal-400">Real-Time</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Paper Trading (1 Col) */}
          <motion.div
            variants={itemVariants}
            className="dark-surface-card p-8 sm:p-10 rounded-2xl flex flex-col justify-between group border-emerald-500/20 hover:border-emerald-500/40"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                  ZERO RISK
                </span>
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Risk-Free Paper Trading
              </h3>
              <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed">
                Test trading strategies with ₹10 Lakhs in virtual cash backed by live market execution algorithms.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-gray-400">Virtual Allocation</span>
                <span className="font-mono font-bold text-emerald-400">₹10,00,000.00</span>
              </div>

              <Link
                to="/register"
                className="w-full premium-btn-outline py-3 rounded-xl font-semibold text-sm text-center justify-center border border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all flex items-center gap-2 group/btn"
              >
                <span>Start Simulating</span>
                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Real-Time Market Data (1 Col) */}
          <motion.div
            variants={itemVariants}
            className="dark-surface-card p-8 sm:p-10 rounded-2xl flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  DIRECT FEED
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Real-Time Data Streams
              </h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Direct feed synchronization with NSE & BSE. Unfiltered order book metrics, tick updates, and seamless streaming.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero artificial polling delays</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live price & volume delta streaming</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: AI Trading Assistant (2 Cols) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 ai-glass-card p-8 sm:p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-500/10">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    AI Trading Assistant & Co-Pilot
                  </h3>
                  <p className="text-xs text-violet-300 font-mono mt-0.5">
                    NEURAL COPILOT ACTIVE
                  </p>
                </div>
              </div>
              <span className="badge-ai font-mono">
                24/7 MARKET ANALYST
              </span>
            </div>

            <p className="text-gray-300 text-base max-w-xl mb-6 leading-relaxed">
              Consult with our built-in intelligence agent for live technical evaluations, risk distribution reviews, or contextual stock summaries.
            </p>

            {/* Simulated Prompt Snippet Bar */}
            <div className="bg-[#080d16]/80 border border-violet-500/20 p-4 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
                <span className="truncate">"Evaluating RSI divergence and key support zones for NIFTY 50..."</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                Analysis Ready
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;

