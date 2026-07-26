import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 w-full z-[100] transition-all duration-500 px-gutter flex items-center justify-between bg-white border-b border-outline-variant/10 shadow-sm ${
        scrolled ? 'h-20' : 'h-16'
      }`}
    >
      <div className="flex items-center gap-8 w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <Link to="/" className="text-3xl font-semibold tracking-tight text-primary cursor-pointer select-none">
          StockSense
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-stack-lg flex-1 justify-center">
          <a
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors"
            href="/#features"
          >
            Features
          </a>
          <a
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors"
            href="/#market"
          >
            Market
          </a>
          <a
            className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors"
            href="/#analytics"
          >
            Research
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-stack-md">
          <Link to="/login" className="px-5 py-2 text-body-md font-semibold text-primary hover:bg-primary/5 transition-all rounded-lg cursor-pointer">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2.5 bg-primary text-on-primary text-body-md font-bold rounded-lg glow-button transition-all cursor-pointer text-center">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
