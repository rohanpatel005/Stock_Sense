import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIInsights = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'Is HDFC Bank a good long-term hold?',
    },
    {
      id: 2,
      sender: 'ai',
      text: 'HDFC Bank is showing strong fundamentals with a 24% credit growth YoY. Our AI Research Score for it is 88/100. Current P/E is 18.5, which is slightly below its 5-year average of 22.1. This suggests a potential undervaluation.',
      confidence: '92%',
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const predefinedReplies = {
    'Should I buy TCS at current levels?': {
      text: 'TCS is currently trading at a key support level of ₹3,850. Technical indicators show a bullish divergence on the daily RSI. Support stands firm at ₹3,800, with a near-term target of ₹4,150. Dividend yield remains attractive at 2.1%.',
      confidence: '89%',
    },
    'How does the budget affect infra stocks?': {
      text: 'The Union Budget has increased capital expenditure by 11.1% to ₹11.11 Lakh Crore. This is highly bullish for infrastructure heavyweights like L&T, IRB Infra, and cement companies. Risk factors include raw material inflation.',
      confidence: '95%',
    },
    'Analyze Reliance Q3 results.': {
      text: 'Reliance Q3 revenue grew 3.2% YoY, led by strong performance in Jio (ARPU up to ₹181.7) and Retail. Ebitda margins expanded by 40 bps. O2C segment remains stable but cyclical pressure persists.',
      confidence: '91%',
    },
  };

  const handlePromptClick = (prompt) => {
    if (isTyping) return;
    
    // Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI Reply
    setTimeout(() => {
      const replyData = predefinedReplies[prompt] || {
        text: "I'm analyzing the latest market data for this query. Our systems indicate high interest in this segment.",
        confidence: '85%',
      };
      
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyData.text,
        confidence: replyData.confidence,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <section className="py-32 px-gutter" id="analytics-intro">
      <div className="max-w-container-max mx-auto bg-inverse-surface rounded-[3rem] p-12 lg:p-20 text-on-primary-fixed overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* Left Text / Prompts */}
          <div>
            <h2 className="text-headline-lg font-bold mb-6 text-white">
              Ask anything. <br />Our AI knows the markets.
            </h2>
            <p className="text-body-lg text-white/70 mb-8">
              From analyzing specific tickers to explaining complex derivatives, get human-like responses backed by petabytes of historical data.
            </p>
            <div className="space-y-4">
              {Object.keys(predefinedReplies).map((prompt, index) => (
                <div
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between group"
                >
                  <span className="text-body-md text-white">{`"${prompt}"`}</span>
                  <ArrowRight className="text-white/40 group-hover:text-secondary group-hover:translate-x-1 transition-all w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Chat Widget */}
          <div className="glass-card rounded-3xl p-8 h-[500px] flex flex-col border-white/20 bg-white/10">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-inner">
                <Sparkles className="text-white w-6 h-6 fill-white/25 animate-pulse" />
              </div>
              <div>
                <div className="text-body-md font-bold text-white">StonksAI Assistant</div>
                <div className="text-label-caps text-primary flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  ONLINE
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="bg-primary/20 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] text-body-sm border border-primary/20">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="glass-card bg-white/95 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-body-sm border-white/40 shadow-sm text-on-background">
                        <p className="mb-2 font-medium">{msg.text}</p>
                        {msg.confidence && (
                          <div className="mt-3 flex items-center gap-2 text-primary font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10" />
                            Confidence: {msg.confidence}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <div className="flex justify-start">
                  <div className="glass-card bg-white/95 p-4 rounded-2xl rounded-tl-none text-body-sm border-white/40 shadow-sm text-on-background flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="mt-6 flex gap-2">
              <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 flex items-center text-body-sm text-white/50 border border-white/10">
                Type your question...
              </div>
              <button className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer">
                <Send className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>

        </div>

        {/* Decorative Background Glow */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
    </section>
  );
};

export default AIInsights;
