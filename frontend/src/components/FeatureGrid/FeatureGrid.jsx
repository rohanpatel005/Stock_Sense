import React from 'react';
import { LineChart, FlaskConical, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureGrid = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-32 px-gutter bg-background/50" id="features">
      <div className="max-w-container-max mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-headline-lg font-bold mb-4">Precision Engineering for Every Trade</h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Our AI-driven ecosystem provides the data and insights previously reserved for institutional high-frequency traders.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 h-auto"
        >
          {/* Large Card 1: AI Stock Research */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 glass-card p-10 rounded-3xl hover-lift"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-12 gap-6">
              <div>
                <LineChart className="text-primary w-12 h-12 mb-4" />
                <h3 className="text-headline-md font-bold mb-2">AI Stock Research</h3>
                <p className="text-body-md text-on-surface-variant max-w-sm">
                  Deep-dive into 5000+ Indian stocks with automated fundamental and technical reports generated in seconds.
                </p>
              </div>
              <div className="w-48 h-32 bg-primary/5 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                <div className="w-full h-full px-4 pt-8">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <path
                      d="M0,25 Q10,5 20,20 T40,10 T60,25 T80,5 T100,20"
                      fill="none"
                      stroke="#006a61"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-outline-variant/10">
              <div>
                <div className="text-label-caps text-on-surface-variant mb-1">LATENCY</div>
                <div className="text-headline-md font-bold text-primary">12ms</div>
              </div>
              <div>
                <div className="text-label-caps text-on-surface-variant mb-1">STOCKS</div>
                <div className="text-headline-md font-bold text-primary">5,000+</div>
              </div>
            </div>
          </motion.div>

          {/* Small Card 1: Paper Trading */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-10 rounded-3xl hover-lift bg-gradient-to-br from-white/60 to-secondary/5 flex flex-col justify-between"
          >
            <div>
              <FlaskConical className="text-secondary w-12 h-12 mb-4" />
              <h3 className="text-headline-md font-bold mb-2">Paper Trading</h3>
              <p className="text-body-md text-on-surface-variant mb-8">
                Test your strategies with ₹10 Lakhs of virtual currency before hitting the real market.
              </p>
            </div>
            <button className="w-full py-4 bg-white/50 border border-secondary/20 text-secondary font-bold rounded-xl hover:bg-secondary/5 transition-all cursor-pointer">
              Start Simulating
            </button>
          </motion.div>

          {/* Small Card 2: Real-time Data */}
          <motion.div
            variants={itemVariants}
            className="glass-card p-10 rounded-3xl hover-lift flex flex-col justify-between"
          >
            <div>
              <Zap className="text-primary w-12 h-12 mb-4" />
              <h3 className="text-headline-md font-bold mb-2">Real-time Data</h3>
              <p className="text-body-md text-on-surface-variant">
                Uninterrupted direct feed from NSE/BSE. No delay, no data loss. Ever.
              </p>
            </div>
          </motion.div>

          {/* Medium Card 2: AI Trading Assistant */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 ai-glass p-10 rounded-3xl hover-lift flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-headline-md font-bold mb-4">AI Trading Assistant</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">
                  Chat with our resident expert AI for instant technical analysis or portfolio rebalancing advice.
                </p>
              </div>
              <div className="flex -space-x-3 shrink-0">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-surface-container flex items-center justify-center shadow-md">
                  <Sparkles className="text-secondary w-5 h-5 fill-secondary" />
                </div>
              </div>
            </div>
            <div className="mt-8 bg-white/40 p-4 rounded-2xl border border-white/50">
              <div className="flex items-center gap-3 text-body-sm text-on-surface-variant italic">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                StonksAI is analyzing TCS support levels...
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureGrid;
