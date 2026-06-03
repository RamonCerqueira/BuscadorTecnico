import { Briefcase } from 'lucide-react';

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  beforeUrl: string;
  afterUrl: string;
};

type PublicPortfolioGridProps = {
  portfolioItems: PortfolioItem[];
};

export function PublicPortfolioGrid({ portfolioItems }: PublicPortfolioGridProps) {
  if (!portfolioItems || portfolioItems.length === 0) {
    return (
      <section className="glass-card p-8 md:p-12 text-center border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
        <Briefcase size={32} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-black tracking-tight mb-2">Portfólio em Construção</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Este profissional ainda não adicionou fotos de seus trabalhos anteriores.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
        <Briefcase size={16} className="text-blue-500" /> Trabalhos Realizados (Antes & Depois)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolioItems.map((item) => (
          <div key={item.id} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 shadow-sm">
            {/* Before/After grid */}
            <div className="grid grid-cols-2 gap-[2px] bg-slate-200 dark:bg-white/10 aspect-[4/3] relative">
              <div className="relative h-full w-full overflow-hidden">
                <img 
                  src={item.beforeUrl} 
                  alt="Antes" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20">Antes</span>
              </div>
              <div className="relative h-full w-full overflow-hidden">
                <img 
                  src={item.afterUrl} 
                  alt="Depois" 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-cyan-600 text-white rounded-lg shadow-lg">Depois</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {item.category && (
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 block">
                  {item.category}
                </span>
              )}
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
