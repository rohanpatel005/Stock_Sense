import React from 'react';
import { motion } from 'framer-motion';

const CategoryTabs = ({ categories, activeCategory, onSelect }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-4 border-b border-slate-100">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategoryTab"
                className="absolute inset-0 bg-[#2563EB] rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{category}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
