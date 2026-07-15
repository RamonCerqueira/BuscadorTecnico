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
  filteredSearchProfessionals,
}: DashboardSearchResultsProps) {
  if (!isSearching) return null;

  return (
    <section className="space-y-6 pt-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Diretório Interno
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Especialistas Encontrados para{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              "{activeSearch || activeCategory}"
            </span>
          </h2>
        </div>
        <button
          onClick={() => {
            setActiveSearch(null);
            setActiveCategory(null);
            setSearchQuery('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 shrink-0 self-start sm:self-center"
        >
          ← Voltar ao Painel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6 text-left">
          <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <Filter size={13} /> Filtros de Busca
            </h3>

            {/* Geolocation filter */}
            <div className="space-y-3 pt-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Localização
              </label>
              <button
                onClick={handleGeoActivate}
                className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                  geoEnabled
                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <MapPin size={12} className={geoEnabled ? 'animate-bounce' : ''} />
                {geoEnabled ? 'Localização Ativa' : 'Buscar Próximos'}
              </button>

              {geoEnabled && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
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
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Verified status checkbox */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                  Apenas Verificados
                </span>
              </label>
            </div>

            {/* Minimum rating drop down */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/60 space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Avaliação Mínima
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-500/50"
              >
                <option value="0">Qualquer Avaliação</option>
                <option value="4">⭐ 4+ Estrelas</option>
                <option value="4.5">⭐ 4.5+ Estrelas</option>
                <option value="5">⭐ 5 Estrelas</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-9">
          {isSearchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSearchProfessionals.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.03] transition-all duration-300 flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-200/60 dark:border-zinc-800 shrink-0">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} className="w-full h-full object-cover" />
                        ) : (
                          <User size={26} className="text-zinc-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full shrink-0">
                        <Star size={11} fill="currentColor" />
                        <span className="text-[10px] font-bold">
                          {Number(p.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-snug">
                        {p.name}
                      </h3>
                      {(p.kycStatus === 'approved' || p.livenessVerified) && (
                        <ShieldCheck size={15} className="text-indigo-500 shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 mt-1">
                      <MapPin size={11} className="text-indigo-500/80" /> {p.city}, {p.state}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[9px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 line-clamp-2 font-medium italic">
                      "{p.bio || 'Profissional parceiro credenciado e dedicado à qualidade.'}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Disponível
                    </span>
                    <Link
                      href={`/profile/${p.id}`}
                      className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-400 flex items-center gap-1 hover:gap-1.5 transition-all"
                    >
                      Ver Perfil <ArrowRight size={11} />
                    </Link>
                  </div>
                </motion.div>
              ))}

              {filteredSearchProfessionals.length === 0 && (
                <div className="col-span-full py-16 text-center space-y-4">
                  <Briefcase size={40} className="mx-auto opacity-10" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-zinc-500 font-medium text-xs">
                    Tente ajustar seus filtros ou termos de busca.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
