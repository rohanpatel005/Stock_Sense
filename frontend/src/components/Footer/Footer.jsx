import React from 'react';
import { Globe, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-gutter border-t border-outline-variant/10 bg-background animate-fade-in">
      <div className="max-w-container-max mx-auto flex flex-col items-center text-center gap-6">
        <div>
          <div className="text-headline-md font-bold tracking-tighter text-primary mb-2 select-none">
            StockSense
          </div>
          <p className="text-body-sm text-on-surface-variant">
            © 2024 StockSense India.
          </p>
        </div>
        <div className="flex gap-6 justify-center">
          <a
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-all cursor-pointer"
            href="#"
            aria-label="Website"
          >
            <Globe className="text-primary w-5 h-5" />
          </a>
          <a
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-all cursor-pointer"
            href="#"
            aria-label="Chat"
          >
            <MessageSquare className="text-primary w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
