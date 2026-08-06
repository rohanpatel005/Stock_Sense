import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, Newspaper, Clock } from 'lucide-react';

const LatestNews = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    
    const fetchNews = async () => {
      setLoading(true);
      setError(false);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/share/${encodeURIComponent(symbol)}/news/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNews(response.data || []);
      } catch (err) {
        console.error("Error fetching latest news:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  if (loading) {
    return (
      <div className="mt-8 space-y-5">
        <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg animate-pulse flex flex-col justify-between h-[180px]">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
                <div className="h-5 bg-white/10 rounded w-full"></div>
                <div className="h-5 bg-white/10 rounded w-5/6"></div>
              </div>
              <div className="h-8 bg-white/10 rounded w-28 self-end mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
        <div className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 text-center shadow-lg">
          <Newspaper className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-400 font-semibold">No recent news available for this stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-6">Latest News</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {news.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-[#0B1118]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg premium-glass-card hover-lift-card group transition-all duration-300 flex flex-col justify-between h-full min-h-[180px]"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold text-[#00E0A4] bg-[#00E0A4]/10 border border-[#00E0A4]/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {item.publisher}
                </span>
                <div className="flex items-center text-[10px] text-slate-400 font-semibold tracking-wide">
                  <Clock className="w-3 h-3 mr-1 opacity-70" />
                  {item.published_at}
                </div>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#00E0A4] transition-colors line-clamp-3">
                {item.title}
              </h4>
            </div>
            
            <div className="mt-6 flex justify-end">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all group/btn"
              >
                Read More
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#00E0A4] transition-colors" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
