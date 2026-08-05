import React from 'react';
import { PieChart, Gauge, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioAnalytics = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 dark-canvas relative overflow-hidden" id="analytics">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Heading & Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-6"
        >
          <div className="badge-emerald mb-6 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md inline-flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide uppercase text-emerald-300">
              Deep Portfolio Analytics
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
            Advanced Portfolio <br />
            <span className="text-gradient-primary">Deep-Vision</span>
          </h2>

          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
            Understand exactly where your virtual portfolio is performing. Analyze sector concentration risk, track paper trading growth, and balance sector weightings with intelligent risk metrics.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 items-start p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1 font-display">Sector Heatmaps</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Visualize concentration exposure across Banking, IT Services, Auto, and Pharma sectors in Indian markets.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-teal-500/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-400 mt-0.5">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1 font-display">Real-Time Risk Meter</h4>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  Evaluate portfolio beta and risk sensitivity against broader NIFTY 50 benchmark movements.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Donut Analytics Widget Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-6 w-full"
        >
          <div className="dark-surface-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/10 bg-[#0a0f18]/90 backdrop-blur-xl">
            
            {/* Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white font-display">Simulated Portfolio Allocation</span>
              </div>
              <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] rounded-full font-mono font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PAPER ANALYTICS
              </div>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex justify-center my-6">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                  {/* Background Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="96"
                    stroke="#ffffff"
                    strokeOpacity="0.05"
                    strokeWidth="20"
                  />
                  {/* Banking Arc (42%) */}
                  <motion.circle
                    initial={{ strokeDashoffset: 603 }}
                    whileInView={{ strokeDashoffset: 350 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="96"
                    stroke="#10b981"
                    strokeDasharray="603"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                  {/* IT Services Arc (35%) */}
                  <motion.circle
                    initial={{ strokeDashoffset: 603 }}
                    whileInView={{ strokeDashoffset: 460 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="96"
                    stroke="#8b5cf6"
                    strokeDasharray="603"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Donut Center Metrics */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                    ₹24.8L
                  </div>
                  <div className="text-[11px] font-bold font-mono tracking-wider text-gray-400 uppercase mt-0.5">
                    SAMPLE PORTFOLIO
                  </div>
                </div>
              </div>
            </div>

            {/* Sector Legend Items */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center p-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-200">Banking (HDFC, ICICI)</span>
                </div>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">42%</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50"></div>
                  <span className="text-xs sm:text-sm font-medium text-gray-200">IT Services (TCS, INF)</span>
                </div>
                <span className="text-xs sm:text-sm font-mono font-bold text-violet-400">35%</span>
              </div>
            </div>

            {/* Sub-label for clarity */}
            <div className="mt-4 text-center">
              <span className="text-[11px] text-gray-500 font-mono">
                Risk-free paper trading simulation metrics
              </span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PortfolioAnalytics;

