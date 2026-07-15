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
      <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 md:p-12 text-center backdrop-blur-md">
        <Briefcase size={28} className="text-zinc-400 dark:text-zinc-700 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
          Portfólio em Construção
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto font-medium">
          Este profissional ainda não adicionou fotos de seus trabalhos anteriores.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2 mb-6">
        <Briefcase size={14} className="text-indigo-500" /> Trabalhos Realizados (Antes & Depois)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolioItems.map((item) => (
          <div
            key={item.id}
            className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 hover:border-indigo-500/30 transition-all duration-300 group shadow-sm flex flex-col justify-between"
          >
            {/* Before/After grid layout */}
            <div className="grid grid-cols-2 gap-[2px] bg-zinc-200 dark:bg-zinc-800 aspect-[4/3] relative overflow-hidden shrink-0">
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={item.beforeUrl}
                  alt="Antes"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black/40 backdrop-blur-md text-white rounded-md border border-white/10">
                  Antes
                </span>
              </div>
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={item.afterUrl}
                  alt="Depois"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/90 text-white rounded-md shadow-sm">
                  Depois
                </span>
              </div>
            </div>

            {/* Item Content details */}
            <div className="p-5 flex-1 flex flex-col justify-between text-left">
              <div>
                {item.category && (
                  <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
                    {item.category}
                  </span>
                )}
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-500 transition-colors">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-2 line-clamp-2 leading-relaxed font-medium">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
