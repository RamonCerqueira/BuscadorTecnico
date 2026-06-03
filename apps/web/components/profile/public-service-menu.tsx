import { Tag } from 'lucide-react';

export function PublicServiceMenu({ services }: { services: any[] }) {
  if (!services || services.length === 0) return null;

  return (
    <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
        <Tag size={16} className="text-emerald-500" /> Tabela de Preços e Serviços
      </h3>

      <div className="space-y-4">
        {services.map((svc) => (
          <div key={svc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:border-emerald-500/30 transition-colors">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">{svc.title}</h4>
              {svc.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{svc.description}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-slate-200 dark:border-white/10 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
              {svc.price ? (
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">A partir de</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">R$ {Number(svc.price).toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-400 italic">Sob orçamento</span>
              )}
              
              <button className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg">
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
