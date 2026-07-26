import React from 'react';
import { PieChart, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';

const PortfolioAnalytics = () => {
  return (
    <section className="py-32 px-gutter bg-surface-container-low" id="analytics">
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Explanations */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="reveal active"
        >
          <h2 className="text-headline-lg font-bold mb-6">
            Advanced Portfolio <br />Deep-Vision
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-10">
            Stop guessing. See exactly where your money is working and where it's stalling with our proprietary sector allocation heatmap and risk-adjusted growth charts.
          </p>
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PieChart className="text-primary w-6 h-6" />
              </div>
              <div>
                <h4 className="text-body-md font-bold mb-1">Sector Heatmaps</h4>
                <p className="text-body-sm text-on-surface-variant">
                  Visualize concentration risks across Banking, IT, Auto, and Pharma sectors.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Gauge className="text-secondary w-6 h-6" />
              </div>
              <div>
                <h4 className="text-body-md font-bold mb-1">Real-time Risk Meter</h4>
                <p className="text-body-sm text-on-surface-variant">
                  Measure your portfolio beta against market volatility in real-time.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Donut Chart widget */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="reveal active"
        >
          <div className="glass-card rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden bg-white/80">
            <div className="flex justify-between items-center mb-10">
              <div className="text-body-md font-bold">Portfolio Overview</div>
              <div className="px-3 py-1 bg-primary/10 text-primary text-label-caps rounded-full font-bold">
                LIVE FEED
              </div>
            </div>

            {/* Donut Chart */}
            <div className="flex justify-center mb-10">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="100"
                    stroke="#f1f5f9"
                    strokeWidth="24"
                  />
                  {/* Banking Arc (42%) */}
                  <motion.circle
                    initial={{ strokeDashoffset: 628 }}
                    whileInView={{ strokeDashoffset: 200 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="100"
                    stroke="#006a61"
                    strokeDasharray="628"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                  {/* IT Services Arc (35%) */}
                  <motion.circle
                    initial={{ strokeDashoffset: 628 }}
                    whileInView={{ strokeDashoffset: 480 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="100"
                    stroke="#4648d4"
                    strokeDasharray="628"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-headline-lg font-bold">₹24.8L</div>
                  <div className="text-label-caps text-on-surface-variant font-bold">TOTAL VALUE</div>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary"></div>
                  <span className="text-body-sm font-semibold">Banking (HDFC, ICICI)</span>
                </div>
                <span className="text-body-sm font-data-mono font-bold">42%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-secondary"></div>
                  <span className="text-body-sm font-semibold">IT Services (TCS, INF)</span>
                </div>
                <span className="text-body-sm font-data-mono font-bold">35%</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PortfolioAnalytics;
