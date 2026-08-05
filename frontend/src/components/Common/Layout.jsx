import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, LineChart } from 'lucide-react';

const Layout = ({ user, handleLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05070D] text-white flex font-sans relative overflow-hidden">
      
      {/* Background Decor matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#00E0A4]/5 via-[#05070D]/0 to-[#05070D]/0 opacity-100" />
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/5 via-[#05070D]/0 to-transparent blur-[120px]" />
      <div className="fixed top-1/4 right-0 w-96 h-96 pointer-events-none bg-[#00E0A4]/10 rounded-full blur-[120px]" />

      <Sidebar user={user} handleLogout={handleLogout} />
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E0A4] to-[#00B37E] flex items-center justify-center shadow-[0_0_15px_rgba(0,224,164,0.3)]">
            <LineChart className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">StockSense</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#0A0D14]/95 backdrop-blur-2xl z-40 overflow-y-auto p-4 flex flex-col border-t border-white/5 shadow-2xl">
          <nav className="space-y-2 mt-4">
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Markets',   path: '/market'    },
              { label: 'Portfolio', path: '/portfolio' },
              { label: 'Orders',    path: '/orders'    },
              { label: 'AI Mentor'       },
              { label: 'News'            },
              { label: 'Settings',        path: '/settings' }
            ].map((item, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.path) navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-4 rounded-2xl text-base font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content wrapper */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full relative z-10 pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
