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
      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded-md shadow-sm border border-white/5">
            {article.source}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
            {article.published_at}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#00E0A4] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1 font-medium">
          {article.description?.replace(/<[^>]*>?/gm, '')}
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
