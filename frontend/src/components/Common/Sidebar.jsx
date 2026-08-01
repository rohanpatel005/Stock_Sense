import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, LogOut } from 'lucide-react';

/**
 * Shared sidebar component used by both Dashboard and Markets pages.
 * @param {string}  activePage - 'dashboard' | 'markets'
 * @param {object}  user       - { full_name: string }
 */
const Sidebar = ({ activePage = 'dashboard', user = {} }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', path: '/dashboard' },
    { label: 'Markets',   page: 'market',    path: '/market'    },
    { label: 'Portfolio', page: 'portfolio', path: '/portfolio' },
    { label: 'Orders',    page: 'orders',    path: '/orders'    },
    { label: 'AI Mentor'       },
    { label: 'News'            },
    { label: 'Settings'        },
  ];

  const handleNav = (item) => {
    if (item.path) navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col fixed h-full z-30">
      {/* Logo */}
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <LineChart className="w-8 h-8 text-[#0F766E]" />
          <div>
            <h1 className="text-xl font-bold text-[#0F766E] tracking-tight">StockSense</h1>
            <p className="text-xs text-slate-400 font-medium">Indian Stock Market AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = item.page === activePage;
          return (
            <button
              key={index}
              onClick={() => handleNav(item)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                isActive
                  ? 'bg-emerald-50 text-[#0F766E]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0F766E]' : 'bg-transparent'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm uppercase">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-slate-800 truncate">
              {user?.full_name || 'StockSense User'}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pro Trader</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
