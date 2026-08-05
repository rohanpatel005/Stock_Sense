import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-32 px-gutter bg-gradient-to-b from-background to-surface-container-highest">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-container-max mx-auto text-center reveal active"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Rocket className="text-primary w-12 h-12" />
        </div>
        <h2 className="text-display-lg font-bold mb-6">
          Start Your Stock Market <br />Journey Today.
        </h2>
        <p className="text-body-lg text-on-surface-variant mb-12 max-w-xl mx-auto">
          Join 12,000+ traders who have already upgraded their edge with AI-powered insights and professional-grade tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="px-10 py-5 bg-primary text-on-primary text-headline-md font-bold rounded-2xl glow-button transition-all cursor-pointer">
            Get Started for Free
          </button>
          <button className="px-10 py-5 glass-card text-on-surface text-headline-md font-bold rounded-2xl hover:bg-white/90 transition-all border border-primary/10 cursor-pointer">
            Upgrade to Pro+
          </button>
        </div>
        <p className="mt-10 text-body-sm text-on-surface-variant">
          No credit card required. SEBI Registered Advice.
        </p>
      </motion.div>
    </section>
  );
};

export default CTA;
