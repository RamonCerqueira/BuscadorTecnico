import { Tag } from 'lucide-react';

export function PublicServiceMenu({ services }: { services: any[] }) {
  if (!services || services.length === 0) return null;

  return (
    <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2 mb-6">
        <Tag size={14} className="text-emerald-500" /> Tabela de Preços e Serviços
      </h3>

      <div className="space-y-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 hover:border-indigo-500/30 transition-all group"
          >
            <div className="text-left">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                {svc.title}
              </h4>
              {svc.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-1.5 leading-relaxed font-medium">
                  {svc.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-zinc-200 dark:border-zinc-800/80 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
              {svc.price ? (
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                    A partir de
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    R$ {Number(svc.price).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 italic uppercase tracking-wider">
                  Sob orçamento
                </span>
              )}

              <button className="rounded-xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider shadow-sm active:scale-[0.98] transition-all hover:bg-zinc-850 dark:hover:bg-zinc-200 shrink-0">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
