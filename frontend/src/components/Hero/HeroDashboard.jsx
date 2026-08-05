import { TrendingUp, Sparkles, ArrowUpRight, Activity, ShieldCheck, PieChart, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroDashboard = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none py-4">
      {/* Glow Backing */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-violet-500/20 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative dark-surface-card border border-white/10 rounded-2xl p-5 sm:p-6 bg-[#0a0f18]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header Bar of Dashboard Preview */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            </div>
            <span className="text-xs font-mono text-gray-400 ml-2 hidden sm:inline">
              STOCKSENSE_ENGINE_v2.4
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3" /> Real-time
            </span>
          </div>
        </div>

        {/* Portfolio Overview Row */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Profit Metric Box */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>Paper Portfolio</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              ₹1,42,840.00
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12.4% THIS MONTH</span>
            </div>
          </div>

          {/* Risk & Health Indicator */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 hover:border-violet-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-1">
              <span>Risk Score</span>
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              Low (2.4/10)
            </div>
            <div className="text-xs font-semibold text-violet-400 flex items-center gap-1 mt-1">
              <PieChart className="w-3 h-3" />
              <span>Optimal Diversification</span>
            </div>
          </div>
        </div>

        {/* Mini Synthetic Trend Graph Visual */}
        <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 rounded-xl p-4 mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-3">
            <span className="flex items-center gap-1.5 font-display">
              <Layers className="w-3.5 h-3.5 text-teal-400" /> NIFTY 50 Market Sentiment
            </span>
            <span className="text-emerald-400 font-mono">+0.84%</span>
          </div>

          {/* SVG Wave Chart Accent */}
          <div className="h-20 w-full flex items-end">
            <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 45 Q 40 30, 80 38 T 160 20 T 240 28 T 300 10 L 300 60 L 0 60 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0 45 Q 40 30, 80 38 T 160 20 T 240 28 T 300 10"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="300" cy="10" r="4" fill="#10b981" className="animate-ping" />
              <circle cx="300" cy="10" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Floating AI Insight Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="ai-glass-card p-4 rounded-xl border border-violet-500/30 bg-violet-950/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-violet-400 w-4 h-4" />
              <span className="text-xs font-bold text-violet-300 font-display tracking-wider uppercase">
                AI PREDICTION
              </span>
            </div>
            <span className="text-[10px] text-violet-300/70 font-mono">92% CONFIDENCE</span>
          </div>
          <div className="text-sm font-bold text-white mb-1">
            Bullish Momentum Detected
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            NIFTY 50 showing strong support at 22,400 levels. Projected target upside: 22,850.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroDashboard;

