import HeroDashboard from './HeroDashboard';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-16 overflow-hidden dark-canvas">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Background Subdued Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full relative z-10">
        {/* Left Content Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-6 flex flex-col items-start"
        >
          {/* Badge */}
          <div className="badge-ai mb-6 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-semibold tracking-wide uppercase text-violet-300">
              AI-Powered Market Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            Understand Markets.{' '}
            <span className="text-gradient-primary block mt-1">Research Smarter.</span>
            <span className="text-gradient-silver block mt-1">Trade with Confidence.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
            StockSense combines real-time Indian stock market analytics, AI-driven sentiment research, and risk-free paper trading into one seamless financial platform.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
            <Link
              to="/register"
              className="premium-btn-primary text-base py-3.5 px-7 rounded-xl font-semibold text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Free Paper Trading</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="/#features"
              className="premium-btn-outline text-base py-3.5 px-6 rounded-xl font-medium text-gray-300 hover:text-white border border-white/10 hover:border-white/25 flex items-center justify-center gap-2"
            >
              Explore Features
            </a>
          </div>

          {/* Trust & Product Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-gray-400 font-medium">Real-time Data</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="text-xs text-gray-400 font-medium">Zero-Risk Paper Trading</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="text-xs text-gray-400 font-medium">Neural Insights</span>
            </div>
          </div>
        </motion.div>

        {/* Right Interactive Visual Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-6 w-full flex justify-center"
        >
          <HeroDashboard />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

