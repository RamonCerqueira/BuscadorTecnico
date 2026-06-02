'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CategoryScrollProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryScroll({ categories, selectedCategory, onSelect }: CategoryScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const startScrolling = (direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    
    scrollIntervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          top: direction === 'up' ? -5 : 5,
          behavior: 'auto'
        });
      }
    }, 16); // ~60fps
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  return (
    <div className="relative flex flex-col h-[400px] w-full rounded-2xl bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 font-black tracking-widest uppercase text-xs text-slate-500">
        Categorias
      </div>

      {canScrollUp && (
        <div 
          className="absolute top-[50px] left-0 right-0 h-10 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent z-10 flex items-start justify-center pt-1 cursor-pointer"
          onMouseEnter={() => startScrolling('up')}
          onMouseLeave={stopScrolling}
        >
          <ChevronUp size={20} className="text-blue-500 animate-bounce" />
        </div>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 overflow-y-scroll hide-scrollbar flex flex-col p-2 space-y-1 relative z-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-3 text-left rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          Todas as Categorias
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-4 py-3 text-left rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {canScrollDown && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#0a0a0a] to-transparent z-10 flex items-end justify-center pb-1 cursor-pointer"
          onMouseEnter={() => startScrolling('down')}
          onMouseLeave={stopScrolling}
        >
          <ChevronDown size={20} className="text-blue-500 animate-bounce" />
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
