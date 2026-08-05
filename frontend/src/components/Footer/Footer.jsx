import { Globe, MessageSquare, TrendingUp, Sparkles, ShieldCheck, ArrowRight, Share2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 dark-canvas relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Banner / Call to Action Strip */}
        <div className="dark-surface-card p-8 sm:p-10 rounded-2xl border border-white/10 mb-16 bg-[#0a0f18]/90 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Risk-Free Market Mastery</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to elevate your trading research?
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">
              Start practicing with ₹10 Lakhs in virtual paper currency and AI-driven stock research today.
            </p>
          </div>
          
          <Link
            to="/register"
            className="premium-btn-primary text-sm sm:text-base py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 shrink-0 group"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                StockSense
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Next-generation financial intelligence platform for Indian equities, powered by neural stock analytics and real-time paper trading simulations.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Website"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Chat Support"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Community"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Resources"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  AI Stock Research
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  Paper Trading
                </a>
              </li>
              <li>
                <a href="/#analytics" className="hover:text-emerald-400 transition-colors">
                  Portfolio Analytics
                </a>
              </li>
              <li>
                <a href="/#analytics-intro" className="hover:text-emerald-400 transition-colors">
                  Neural Copilot
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">
              Quick Access
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  Register Account
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-400 transition-colors">
                  NSE/BSE Feeds
                </a>
              </li>
            </ul>
          </div>

          {/* Safety & Compliance */}
          <div>
            <h4 className="font-display text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">
              Compliance
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-normal">
                  Educational paper-trading platform. No real monetary transactions executed.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} StockSense India. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>NSE & BSE Market Intelligence</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span>Paper Trading Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


