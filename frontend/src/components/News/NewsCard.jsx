import React from 'react';
import { Bookmark, Share2, ArrowUpRight } from 'lucide-react';

const NewsCard = ({ article, isBookmarked, toggleBookmark }) => {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={article.image || 'https://via.placeholder.com/800x450?text=News'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
          {article.source}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 shadow-sm flex items-center gap-1">
          {article.published}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 bg-blue-50 text-[#2563EB] text-xs font-bold rounded-md">
            {article.category}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#2563EB] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {article.summary}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
          <a
            href={article.link}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors"
          >
            Read More
            <ArrowUpRight className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // handle share logic
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(article);
              }}
              className={`p-2 rounded-full transition-all ${
                isBookmarked
                  ? 'text-[#2563EB] bg-blue-50 hover:bg-blue-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
