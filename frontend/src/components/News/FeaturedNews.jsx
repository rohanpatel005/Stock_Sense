import React from 'react';
import { Bookmark, Share2, ArrowRight } from 'lucide-react';

const FeaturedNews = ({ article, isBookmarked, toggleBookmark }) => {
  if (!article) return null;

  return (
    <div className="relative group bg-slate-900 rounded-3xl overflow-hidden shadow-lg cursor-pointer">
      <div className="absolute inset-0">
        <img
          src={article.image || 'https://via.placeholder.com/1200x600?text=Featured+News'}
          alt={article.title}
          className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>

      <div className="relative p-6 md:p-10 flex flex-col justify-end min-h-[400px] md:min-h-[500px]">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg uppercase tracking-wider">
            Featured
          </span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-lg">
            {article.category}
          </span>
          <span className="text-slate-300 text-xs font-medium">{article.published}</span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4 max-w-4xl">
          {article.title}
        </h2>
        
        <p className="text-slate-300 text-sm md:text-base max-w-3xl mb-8 line-clamp-2">
          {article.summary}
        </p>

        <div className="flex items-center justify-between">
          <a
            href={article.link}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 inline-flex"
          >
            Read More
            <ArrowRight className="w-5 h-5" />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(article);
              }}
              className={`p-3 backdrop-blur-md rounded-xl transition-all ${
                isBookmarked
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;
