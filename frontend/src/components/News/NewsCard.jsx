import { ArrowUpRight } from 'lucide-react';

const NewsCard = ({ article }) => {
  const handleClick = () => {
    if (article.article_url) {
      window.open(article.article_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="group bg-[#0B1118]/60 backdrop-blur-xl rounded-[24px] overflow-hidden flex flex-col h-full cursor-pointer premium-glass-card"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-white/5 flex items-center justify-center">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2 opacity-50">
            <span className="text-3xl font-bold opacity-30">News</span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-[#0B1118]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {article.source}
        </div>
        <div className="absolute top-3 right-3 bg-[#0B1118]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center gap-1">
          {article.published_at}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#00E0A4] transition-colors mt-2">
          {article.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 font-medium">
          {article.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <a
            href={article.article_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-sm font-bold text-[#00E0A4] hover:text-[#00B37E] transition-colors drop-shadow-[0_0_5px_rgba(0,224,164,0.5)]"
          >
            Read More
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
