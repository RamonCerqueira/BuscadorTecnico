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
  quickCategories
}: DashboardSearchProps) {
  if (userType === 'client') {
    return (
      <div className="space-y-4 pt-2">
        <form onSubmit={handleSearchSubmit} className="relative group w-full">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-25 group-hover:opacity-35 transition duration-500"></div>
          <div className="relative flex items-center bg-[#0a0b10] border border-white/10 rounded-[1.8rem] p-2 shadow-2xl">
            <Search size={22} className="ml-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Busque por eletricista, pintor, encanador, climatização..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm md:text-base font-semibold outline-none text-white placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-[1.4rem] font-bold transition-all active:scale-95 text-xs md:text-sm uppercase tracking-widest shrink-0 shadow-lg shadow-blue-500/20">
              Buscar
            </button>
          </div>
        </form>

        {/* Sugestões de Categorias rápidas que mudam o filtro em tela */}
        <div className="flex flex-wrap gap-2 pt-1 items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1.5">Sugestões:</span>
          {quickCategories.map((cat) => (
            <button 
              type="button"
              onClick={() => {
                setActiveCategory(cat.category);
                setActiveSearch(null);
                setSearchQuery('');
              }}
              key={cat.label} 
              className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.04] text-[9px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/[0.08] hover:text-white hover:border-white/10 transition-all active:scale-95 text-left"
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
      <Link href="/opportunities" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20 shrink-0">
        <Briefcase size={14} /> Buscar Oportunidades
      </Link>
      <Link href="/profile" className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.05] border border-white/10 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-300 hover:bg-white/[0.1] hover:text-white transition-all active:scale-95 shrink-0">
        <User size={14} /> Editar Perfil
      </Link>
    </div>
  );
}
