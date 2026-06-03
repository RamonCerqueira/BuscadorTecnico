import { Filter, MapPin, ShieldCheck, Star, User, ArrowRight, CheckCircle2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SkeletonCard } from '@/components/ui/skeleton';

type Professional = {
  id: string;
  name: string;
  avatarUrl?: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  city: string;
  state: string;
  bio?: string;
  kycStatus?: string;
  livenessVerified?: boolean;
};

type DashboardSearchResultsProps = {
  isSearching: boolean;
  activeSearch: string | null;
  activeCategory: string | null;
  setActiveSearch: (val: string | null) => void;
  setActiveCategory: (val: string | null) => void;
  setSearchQuery: (val: string) => void;
  geoEnabled: boolean;
  handleGeoActivate: () => void;
  radius: number;
  setRadius: (val: number) => void;
  onlyVerified: boolean;
  setOnlyVerified: (val: boolean) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  isSearchLoading: boolean;
  filteredSearchProfessionals: Professional[];
};

export function DashboardSearchResults({
  isSearching,
  activeSearch,
  activeCategory,
  setActiveSearch,
  setActiveCategory,
  setSearchQuery,
  geoEnabled,
  handleGeoActivate,
  radius,
  setRadius,
  onlyVerified,
  setOnlyVerified,
  minRating,
  setMinRating,
  isSearchLoading,
  filteredSearchProfessionals
}: DashboardSearchResultsProps) {
  if (!isSearching) return null;

  return (
    <section className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Diretório Interno</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Especialistas Encontrados para <span className="premium-gradient-text">"{activeSearch || activeCategory}"</span>
          </h2>
        </div>
        <button 
          onClick={() => {
            setActiveSearch(null);
            setActiveCategory(null);
            setSearchQuery('');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all border border-slate-300/40 dark:border-white/5 shrink-0 self-start sm:self-center"
        >
          ← Voltar ao Painel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar de Filtros Internos */}
        <aside className="lg:col-span-3 space-y-6 text-left">
          <div className="glass-card p-6 border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111119] space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter size={14} /> Filtros de Busca
            </h3>

            {/* Filtro Geolocalização */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Localização</label>
              <button
                onClick={handleGeoActivate}
                className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  geoEnabled 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <MapPin size={12} className={geoEnabled ? 'animate-bounce' : ''} />
                {geoEnabled ? 'Localização Ativa' : 'Buscar Próximos'}
              </button>

              {geoEnabled && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Raio</span>
                    <span>{radius} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Filtro de Prestador Verificado */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Apenas Verificados</span>
              </label>
            </div>

            {/* Filtro de Nota Mínima */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avaliação Mínima</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-[#0c0d12] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-black text-slate-600 dark:text-slate-300 outline-none"
              >
                <option value="0">Qualquer Avaliação</option>
                <option value="4">⭐ 4+ Estrelas</option>
                <option value="4.5">⭐ 4.5+ Estrelas</option>
                <option value="5">⭐ 5 Estrelas</option>
              </select>
            </div>

          </div>
        </aside>

        {/* Grid de Resultados de Profissionais */}
        <div className="lg:col-span-9">
          {isSearchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSearchProfessionals.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group glass-card p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col justify-between border border-slate-200/60 dark:border-white/5 text-left"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-white/10 shrink-0">
                        {p.avatarUrl ? <img src={p.avatarUrl} className="w-full h-full object-cover" /> : <User size={28} className="text-slate-400" />}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full shrink-0">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[10px] font-black">{p.rating || '0.0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg font-black group-hover:text-blue-600 transition-colors leading-snug">{p.name}</h3>
                      {(p.kycStatus === 'approved' || p.livenessVerified) && (
                        <ShieldCheck size={16} className="text-blue-500 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-1">
                      <MapPin size={12} className="text-blue-500" /> {p.city}, {p.state}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.specialties.slice(0, 3).map(s => (
                        <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-tight text-slate-400">{s}</span>
                      ))}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 line-clamp-2 font-medium italic">
                      "{p.bio || 'Profissional dedicado e comprometido com a qualidade e satisfação do cliente.'}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Disponível
                    </span>
                    <Link href={`/profile/${p.id}`} className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                      Ver Perfil <ArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              ))}

              {filteredSearchProfessionals.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-4">
                  <Briefcase size={48} className="mx-auto opacity-10" />
                  <h3 className="text-lg font-black">Nenhum profissional encontrado</h3>
                  <p className="text-slate-500 font-medium text-xs">Tente ajustar seus filtros ou termos de busca.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
