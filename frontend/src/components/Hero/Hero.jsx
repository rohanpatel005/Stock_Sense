import React from 'react';
import HeroDashboard from './HeroDashboard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden px-gutter">
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left Content Side */}
        <div className="reveal active">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/10 text-secondary text-label-caps rounded-full mb-6 border border-secondary/20 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            NEXT-GEN TRADING ENGINE
          </div>
          <h1 className="text-display-lg font-bold leading-tight mb-6">
            Master the <span className="gradient-text">Indian Stock Market</span> with AI.
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-lg">
            Trade Smarter. Learn Faster. Invest with Confidence. StonksAI combines deep neural analytics with the NSE & BSE real-time data to give you the ultimate edge.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-8 py-4 bg-primary text-on-primary text-body-md font-bold rounded-xl flex items-center gap-2 glow-button transition-all cursor-pointer text-center">
              Start Trading Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Right Dashboard Mock Side */}
        <HeroDashboard />
      </div>
    </section>
  );
};

export default Hero;
