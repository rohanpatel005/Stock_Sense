import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Send, ArrowRight, Bot, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AIInsights = () => {
  const [messages, setMessages] = useState([]);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const handlePromptClick = async (prompt) => {
    if (isTyping) return;
    
    // Add User Message
    const userMsg = { id: Date.now(), sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai/chat/",
        { message: prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.data.reply || "I'm sorry, I couldn't process that request.",
        confidence: 'High',
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I'm having trouble connecting right now. Please try again later.",
          confidence: 'Low'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 dark-canvas relative overflow-hidden" id="analytics-intro">
      <div className="max-w-7xl mx-auto dark-surface-card rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 relative overflow-hidden bg-[#0a0f18]/95 backdrop-blur-xl shadow-2xl">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10">
          
          {/* Left Text & Interactive Prompts Column */}
          <div className="lg:col-span-6">
            <div className="badge-ai mb-6 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md inline-flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold tracking-wide uppercase text-violet-300">
                Neural Market Copilot
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Ask Anything.{' '}
              <span className="text-gradient-ai block mt-1">Our AI Knows the Markets.</span>
            </h2>

            <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              From analyzing technical support levels to breaking down complex earnings calls, get instant multi-source insights powered by real-time Indian equities data.
            </p>

            {/* Clickable Sample Prompts */}
            <div className="space-y-3.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono mb-2">
                Click a sample query to simulate analysis:
              </div>
              {[
                "What is the short-term outlook for Nifty 50?",
                "Are IT stocks overvalued right now?",
                "How will the recent RBI repo rate decision impact bank stocks?"
              ].map((prompt, index) => (
                <div
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-4 bg-white/[0.03] border border-white/10 hover:border-violet-500/40 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all flex items-center justify-between group"
                >
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{`"${prompt}"`}</span>
                  <ArrowRight className="text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all w-4 h-4 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right AI Chat Interface Widget */}
          <div className="lg:col-span-6">
            <div className="ai-glass-card rounded-2xl p-6 sm:p-7 h-[520px] flex flex-col border border-violet-500/30 bg-[#090d16]/90 shadow-2xl relative">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-md shadow-violet-500/20">
                    <div className="w-full h-full bg-[#0a0f18] rounded-[10px] flex items-center justify-center">
                      <Sparkles className="text-violet-400 w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-display">StockSense AI Assistant</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      ONLINE & READY
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-mono text-violet-300">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                  <span>v2.4 Neural Model</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
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
                        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 p-3.5 rounded-2xl rounded-tr-none max-w-[85%] text-xs sm:text-sm font-medium">
                          {msg.text}
                        </div>
                      ) : (
                        <div className="bg-white/[0.04] border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[90%] text-xs sm:text-sm text-gray-200 shadow-sm leading-relaxed">
                          <p className="mb-3">{msg.text}</p>
                          {msg.confidence && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-emerald-400 font-mono text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Model Confidence Score: {msg.confidence}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.04] border border-white/10 p-3.5 rounded-2xl rounded-tl-none text-xs text-gray-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                      <span className="font-mono text-violet-300">Analyzing market parameters...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 flex items-center text-xs sm:text-sm text-gray-400">
                  Select a prompt above or ask a question...
                </div>
                <button
                  disabled
                  className="w-10 h-10 rounded-xl bg-violet-600/50 border border-violet-500/30 text-white/50 flex items-center justify-center cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIInsights;

