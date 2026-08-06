import { ArrowRight } from 'lucide-react';

const FeaturedNews = ({ article }) => {
  if (!article) return null;

  const handleClick = () => {
    if (article.article_url) {
      window.open(article.article_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="relative group bg-[#0B1118]/80 rounded-[24px] overflow-hidden cursor-pointer premium-glass-card shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B1118] to-[#121A25]" />

      <div className="relative p-6 md:p-10 flex flex-col justify-end min-h-[400px] md:min-h-[500px]">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
            Featured
          </span>
          <span className="px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-sm">
            {article.source}
          </span>
          <span className="text-slate-300 text-xs font-medium">{article.published_at}</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 max-w-4xl">
          {article.title}
        </h2>
        
        <p className="text-slate-300 text-sm md:text-base max-w-3xl mb-8 line-clamp-3">
          {article.description?.replace(/<[^>]*>?/gm, '')}
        </p>

        <div className="flex items-center justify-between">
          <a
            href={article.article_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00E0A4] to-[#00B37E] hover:from-[#00E0A4] hover:to-[#00E0A4] text-[#05070D] px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,224,164,0.4)] hover:shadow-[0_0_25px_rgba(0,224,164,0.6)] transform hover:-translate-y-0.5 inline-flex"
          >
            Read More
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
