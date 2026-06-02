'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { SkeletonCard } from '@/components/ui/skeleton';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  MapPin, 
  Filter,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  User
} from 'lucide-react';

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

const CATEGORIES = ['Ar Condicionado', 'Elétrica', 'Hidráulica', 'Limpeza', 'Reformas', 'Informática'];

export default function CompaniesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Geolocation and advanced filters states
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(20);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const handleGeoActivate = () => {
    if (geoEnabled) {
      setGeoEnabled(false);
      setLat(null);
      setLng(null);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setGeoEnabled(true);
        },
        (err) => {
          console.error(err);
          alert('Erro ao obter sua localização. Certifique-se de permitir o acesso nas configurações do navegador.');
        }
      );
    } else {
      alert('Geolocalização não suportada no seu navegador.');
    }
  };

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', selectedCategory, geoEnabled, lat, lng, radius],
    queryFn: () => {
      if (geoEnabled && lat && lng) {
        return apiGet<Professional[]>(`/users/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      }
      return apiGet<Professional[]>(`/users/professionals${selectedCategory ? `?category=${selectedCategory}` : ''}`);
    }
  });

  const filteredProfessionals = professionals?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesVerified = !onlyVerified || p.kycStatus === 'approved' || p.livenessVerified;
    const matchesRating = !minRating || (p.rating && p.rating >= minRating);
    const matchesCategory = !selectedCategory || p.specialties?.includes(selectedCategory);

    return matchesSearch && matchesVerified && matchesRating && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="container mx-auto max-w-6xl text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
             <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Diretório de Elite</span>
             <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-4">
               Encontre os Melhores <span className="premium-gradient-text">Profissionais</span>
             </h1>
             <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-6">
               Especialistas verificados e avaliados pela comunidade TechFix para garantir o sucesso do seu projeto.
             </p>
          </motion.div>

          <div className="max-w-2xl mx-auto pt-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative flex items-center bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl">
                <Search size={20} className="ml-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome da empresa ou técnico..."
                  className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-4 font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-4 gap-12">
        
        {/* Sidebar Filters */}
        <aside className="space-y-10 lg:sticky lg:top-32 h-fit">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Filter size={14} /> Categorias
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
              >
                Todas as Categorias
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de Geolocalização e Avançados */}
          <div className="space-y-6 border-t border-slate-200 dark:border-white/10 pt-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={14} /> Localização
            </h3>
            
            <button
              onClick={handleGeoActivate}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                geoEnabled 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300'
              }`}
            >
              <MapPin size={14} className={geoEnabled ? 'animate-bounce' : ''} />
              {geoEnabled ? 'Localização Ativa' : 'Buscar Próximos de Mim'}
            </button>

            {geoEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Raio de Busca</span>
                  <span>{radius} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-6 border-t border-slate-200 dark:border-white/10 pt-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Filter size={14} /> Filtros de Qualidade
            </h3>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Apenas Verificados (KYC)</span>
            </label>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avaliação Mínima</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 outline-none"
              >
                <option value="0">Qualquer Avaliação</option>
                <option value="4">⭐ 4+ Estrelas</option>
                <option value="4.5">⭐ 4.5+ Estrelas</option>
                <option value="5">⭐ 5 Estrelas</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-blue-600 text-white space-y-4">
             <ShieldCheck size={32} />
             <h4 className="font-black text-lg">Garantia TechFix</h4>
             <p className="text-xs font-medium opacity-80 leading-relaxed">Todos os profissionais nesta lista possuem identidade verificada e histórico de qualidade.</p>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {filteredProfessionals?.map((p, i) => (
                 <motion.div
                   key={p.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="group glass-card p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col justify-between"
                 >
                    <div>
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                          {p.avatarUrl ? <img src={p.avatarUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-slate-300" />}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                          <Star size={14} fill="currentColor" />
                          <span className="text-xs font-black">{p.rating || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black group-hover:text-blue-600 transition-colors">{p.name}</h3>
                        {(p.kycStatus === 'approved' || p.livenessVerified) && (
                          <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-blue-500" /> {p.city}, {p.state}
                        </span>
                        {geoEnabled && (p as any).distance !== undefined && (
                          <span className="text-emerald-500 font-extrabold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            a {((p as any).distance as number).toFixed(1)} km
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-6">
                        {p.specialties.slice(0, 3).map(s => (
                          <span key={s} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-tight text-slate-500">{s}</span>
                        ))}
                      </div>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 line-clamp-2 font-medium italic">
                        "{p.bio || 'Profissional dedicado e comprometido com a qualidade e satisfação do cliente.'}"
                      </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                         <CheckCircle2 size={14} /> Disponível
                       </span>
                       <Link href={`/profile/${p.id}`} className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                         Ver Perfil <ArrowRight size={14} />
                       </Link>
                    </div>
                 </motion.div>
               ))}

               {filteredProfessionals?.length === 0 && (
                 <div className="col-span-full py-20 text-center space-y-4">
                    <Briefcase size={64} className="mx-auto opacity-10" />
                    <h3 className="text-xl font-black">Nenhum profissional encontrado</h3>
                    <p className="text-slate-500 font-medium">Tente ajustar seus filtros ou busca.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
