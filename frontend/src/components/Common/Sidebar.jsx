import { useNavigate, useLocation } from 'react-router-dom';
import { LineChart, LogOut, Star } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

/**
 * Shared sidebar component used across the app.
 * @param {object}  user       - { full_name: string }
 */
const Sidebar = ({ user = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const getActivePage = () => {
    const path = location.pathname;
    if (path.startsWith('/market') || path.startsWith('/share')) return 'market';
    if (path.startsWith('/portfolio')) return 'portfolio';
    if (path.startsWith('/orders')) return 'orders';
    if (path.startsWith('/news')) return 'news';
    if (path.startsWith('/watchlist')) return 'watchlist';
    if (path.startsWith('/ai-mentor')) return 'ai_mentor';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };
  const activePage = getActivePage();

  let displayUser = user;
  const storedUserStr = localStorage.getItem('user');
  if ((!displayUser || !displayUser.full_name || displayUser.full_name === 'StockSense User') && storedUserStr) {
    try {
      const parsed = JSON.parse(storedUserStr);
      const name = parsed.full_name || [parsed.first_name, parsed.last_name].filter(Boolean).join(' ') || parsed.username || parsed.email?.split('@')[0] || 'StockSense User';
      displayUser = { ...parsed, full_name: name };
    } catch (_e) {
      // Ignore
    }
  }

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', path: '/dashboard' },
    { label: 'Markets',   page: 'market',    path: '/market'    },
    { label: 'Portfolio', page: 'portfolio', path: '/portfolio' },
    { label: 'Watchlist', page: 'watchlist', path: '/watchlist', badge: watchlist.length > 0 ? watchlist.length : null },
    { label: 'Orders',    page: 'orders',    path: '/orders'    },
    { label: 'AI Mentor', page: 'ai_mentor', path: '/ai-mentor' },
    { label: 'News',      page: 'news',      path: '/news'      },
    { label: 'Settings',  page: 'settings',  path: '/settings'  },
  ];

  const handleNav = (item) => {
    if (item.path) navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <aside className="font-sans w-72 bg-[#0A0D14]/80 backdrop-blur-xl border-r border-white/10 hidden lg:flex flex-col fixed h-full z-30">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E0A4] to-[#00B37E] flex items-center justify-center shadow-[0_0_20px_rgba(0,224,164,0.3)]">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">StockSense</h1>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Indian Stock Market AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = item.page === activePage;
          return (
            <button
              key={index}
              onClick={() => handleNav(item)}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-between group relative overflow-hidden ${
                isActive
                  ? 'sidebar-active text-[#00E0A4]'
                  : 'sidebar-item-hover text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.label === 'Watchlist' && <Star className={`w-4 h-4 ${isActive ? 'text-[#00E0A4]' : 'text-slate-400 group-hover:text-slate-300'}`} />}
                {item.label}
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-[#00E0A4] text-[#05070D]' : 'bg-white/10 text-slate-300 group-hover:bg-white/20'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 p-3 rounded-[16px] cursor-pointer group premium-glass-card">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E0A4] to-emerald-600 text-[#05070D] flex items-center justify-center font-bold text-sm uppercase shadow-lg shadow-[#00E0A4]/20">
            {displayUser?.full_name ? displayUser.full_name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00E0A4] transition-colors">
              {displayUser?.full_name || 'StockSense User'}
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pro Trader</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
