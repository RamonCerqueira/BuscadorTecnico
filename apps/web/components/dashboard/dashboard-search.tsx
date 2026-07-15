import { Search, Briefcase, User } from 'lucide-react';
import Link from 'next/link';

type DashboardSearchProps = {
  userType: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  setActiveCategory: (cat: string | null) => void;
  setActiveSearch: (search: string | null) => void;
  quickCategories: { label: string; category: string }[];
};

export function DashboardSearch({
  userType,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  setActiveCategory,
  setActiveSearch,
  quickCategories,
}: DashboardSearchProps) {
  if (userType === 'client') {
    return (
      <div className="space-y-4 pt-2">
        <form onSubmit={handleSearchSubmit} className="relative group w-full">
          {/* Subtle hover background highlight */}
          <div className="absolute -inset-1 bg-indigo-500/[0.03] rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
          
          <div className="relative flex items-center bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-full p-1.5 focus-within:border-indigo-500/50 dark:focus-within:border-indigo-500/30 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-300 shadow-sm">
            <Search size={18} className="ml-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Busque por eletricista, pintor, encanador, climatização..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2.5 text-sm font-semibold outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-6 py-2.5 rounded-full font-semibold transition-all active:scale-[0.98] text-xs tracking-wide shrink-0 shadow-sm"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Suggestion Category chips */}
        <div className="flex flex-wrap gap-2 pt-1 items-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mr-1.5">
            Sugestões:
          </span>
          {quickCategories.map((cat) => (
            <button
              type="button"
              onClick={() => {
                setActiveCategory(cat.category);
                setActiveSearch(null);
                setSearchQuery('');
              }}
              key={cat.label}
              className="px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all active:scale-[0.98]"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all shadow-sm shrink-0"
      >
        <Briefcase size={13} /> Buscar Oportunidades
      </Link>
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all shadow-sm shrink-0"
      >
        <User size={13} /> Editar Perfil
      </Link>
    </div>
  );
}
