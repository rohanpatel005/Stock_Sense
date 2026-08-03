import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X, LineChart } from 'lucide-react';

const Layout = ({ user, handleLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex font-sans">
      <Sidebar user={user} handleLogout={handleLogout} />
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <LineChart className="w-6 h-6 text-[#0F766E]" />
          <span className="text-lg font-bold text-[#0F766E]">StockSense</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-30 overflow-y-auto p-4 flex flex-col">
          <nav className="space-y-1">
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
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content wrapper */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
