import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistData, setWatchlistData] = useState({});

  const fetchWatchlist = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/watchlist/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const symbols = res.data.map(item => item.symbol);
      setWatchlist(symbols);
      
      // Fetch live data for each symbol
      const fetchPromises = symbols.map(async (symbol) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/share/${encodeURIComponent(symbol)}/`);
          const data = response.data;
          return {
            symbol: data.symbol,
            name: data.company_name || "Watchlisted Stock",
            price: data.live_price,
            change: `${data.today_change_percent > 0 ? '+' : ''}${data.today_change_percent}%`,
            trend: data.today_change_percent >= 0 ? "up" : "down"
          };
        } catch (_e) {
          return {
            symbol,
            name: "Data Unavailable",
            price: "---",
            change: "0.0%",
            trend: "up"
          };
        }
      });
      
      const liveDataArray = await Promise.all(fetchPromises);
      const liveDataMap = {};
      liveDataArray.forEach(item => {
        liveDataMap[item.symbol] = item;
      });
      setWatchlistData(liveDataMap);

    } catch (err) {
      console.error("Failed to fetch watchlist", err);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const toggleWatchlist = async (symbol) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const isWatchlisted = watchlist.includes(symbol);
    
    // Optimistic UI update
    setWatchlist(prev => 
      isWatchlisted ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );

    try {
      if (isWatchlisted) {
        await axios.delete(`http://127.0.0.1:8000/api/watchlist/${encodeURIComponent(symbol)}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post("http://127.0.0.1:8000/api/watchlist/", { symbol }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      // Revert on failure
      setWatchlist(prev => 
        isWatchlisted ? [...prev, symbol] : prev.filter(s => s !== symbol)
      );
      console.error("Failed to update watchlist", err);
    }
    
    // Always re-fetch to ensure watchlistData has the latest live data for newly added stocks
    fetchWatchlist();
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, watchlistData, toggleWatchlist, fetchWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};
