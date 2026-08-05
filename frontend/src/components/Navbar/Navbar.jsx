import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Menu, X, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#06090e]/90 backdrop-blur-xl border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#06090e]/95 via-[#06090e]/80 to-transparent border-white/5 py-4.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
            <div className="w-full h-full bg-[#06090e] rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-white flex items-center">
            Stock<span className="text-emerald-400">Sense</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 bg-white/[0.03] border border-white/10 rounded-full px-6 py-2 backdrop-blur-md">
          <a
            href="/#features"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="/#market"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Market
          </a>
          <a
            href="/#analytics"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Research
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="premium-btn-primary text-sm py-2 px-5 font-semibold text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0f18] border-b border-white/10 px-4 pt-4 pb-6 mt-2 shadow-2xl"
          >
            <div className="flex flex-col gap-3">
              <a
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              >
                Features
              </a>
              <a
                href="/#market"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              >
                Market
              </a>
              <a
                href="/#analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              >
                Research
              </a>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-gray-200 hover:bg-white/5 rounded-xl font-semibold border border-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 premium-btn-primary rounded-xl font-semibold text-white shadow-md"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
