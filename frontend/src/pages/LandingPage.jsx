import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import MarketPreview from '../components/MarketPreview/MarketPreview';
import FeatureGrid from '../components/FeatureGrid/FeatureGrid';
import AIInsights from '../components/AIInsights/AIInsights';
import PortfolioAnalytics from '../components/PortfolioAnalytics/PortfolioAnalytics';
import Footer from '../components/Footer/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#04070d] text-white relative z-10">
      <Navbar />
      <Hero />
      <MarketPreview />
      <FeatureGrid />
      <AIInsights />
      <PortfolioAnalytics />
      <Footer />
    </div>
  );
};

export default LandingPage;
