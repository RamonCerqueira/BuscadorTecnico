'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Professional } from '@/types/user';
import { apiGet } from '@/lib/api/client';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useSessionStore } from '@/lib/store';
import Link from 'next/link';
import { CategoryScroll } from '@/components/ui/category-scroll';
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  User,
  Filter,
  DollarSign,
  Building2,
  FileText,
} from 'lucide-react';

const PREDEFINED_CATEGORIES = [
  'Ar Condicionado',
  'Elétrica',
  'Hidráulica',
  'Pintura',
  'Gesso & Drywall',
  'Pisos & Revestimentos',
  'Alvenaria & Obras',
  'Automação Residencial',
  'Segurança Eletrônica',
  'Portões & Cerca Elétrica',
  'Redes & TI',
  'Mecânica Industrial',
  'Geradores & Motores',
  'Limpeza & Conservação',
  'Manutenção Preventiva',
];

export default function CompaniesPage() {
  const { token } = useSessionStore();
  const isLoggedIn = !!token;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Advanced Filters states
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(20);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [profileType, setProfileType] = useState<'all' | 'technician' | 'company'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'eco' | 'mid' | 'premium'>('all');
  const [onlyNF, setOnlyNF] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const searchParam = params.get('search');
      if (catParam) setSelectedCategory(catParam);
      if (searchParam) setSearch(searchParam);
    }
  }, []);

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
          alert(
            'Erro ao obter sua localização. Certifique-se de permitir o acesso nas configurações do navegador.'
          );
        }
      );
    } else {
      alert('Geolocalização não suportada no seu navegador.');
    }
  };

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', selectedCategory, geoEnabled, lat, lng, radius],
    queryFn: async () => {
      if (geoEnabled && lat && lng) {
        return apiGet<Professional[]>(`/users/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      }
      const res = await apiGet<{ data: Professional[] }>(
        `/users/professionals${
          selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''
        }`
      );
      return res?.data || [];
    },
  });

  // Combine predefined taxonomy with any dynamic specialties found in DB
  const dynamicCategories = Array.from(
    new Set([
      ...PREDEFINED_CATEGORIES,
      ...(professionals?.flatMap((p) => p.specialties || []) || []),
    ])
  ).sort();

  const filteredProfessionals = professionals?.filter((p) => {
    // 1. Text Search Filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

    // 2. KYC verification filter
    const matchesVerified = !onlyVerified || p.kycStatus === 'approved' || p.livenessVerified;

    // 3. Minimum rating filter
    const matchesRating = !minRating || (p.rating && p.rating >= minRating);

    // 4. Category filter
    const matchesCategory = !selectedCategory || p.specialties?.includes(selectedCategory);

    // 5. Profile type filter (autonomous vs company)
    const matchesProfileType = profileType === 'all' || p.userType === profileType;

    // 6. Price range simulation filter
    const simulatedHourlyRate = p.userType === 'company' ? 180 : 80;
    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'eco' && simulatedHourlyRate <= 100) ||
      (priceRange === 'mid' && simulatedHourlyRate > 100 && simulatedHourlyRate <= 180) ||
      (priceRange === 'premium' && simulatedHourlyRate > 180);

    // 7. Invoice emission filter (generally companies or specific technicians with CNPJ)
    const matchesNF = !onlyNF || p.userType === 'company';

    return (
      matchesSearch &&
      matchesVerified &&
      matchesRating &&
      matchesCategory &&
      matchesProfileType &&
      matchesPrice &&
      matchesNF
    );
  });

  const displayedProfessionals = isLoggedIn
    ? filteredProfessionals
    : filteredProfessionals?.slice(0, 2);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-32 pb-12 px-6 bg-zinc-100/50 dark:bg-[#0c0c0e]/30 overflow-hidden">
        {/* Subtle grid layout overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

        <div className="container mx-auto max-w-5xl text-center space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Top compact Guarantee banner */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 border border-indigo-500/10 text-[9px] font-bold uppercase tracking-wider">
              <ShieldCheck size={11} /> Garantia TechFix: Especialistas 100% Verificados
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white pt-2">
              Encontre os Melhores{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Profissionais
              </span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
              Filtre nossa elite de técnicos e empresas especializadas com ferramentas avançadas de
              geolocalização, orçamento e conformidade fiscal.
            </p>
          </motion.div>

          <div className="max-w-xl mx-auto pt-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-indigo-500/[0.02] rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />
              <div className="relative flex items-center bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-full p-1.5 focus-within:border-indigo-500/50 dark:focus-within:border-indigo-500/30 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-300 shadow-sm">
                <Search size={18} className="ml-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar por nome da empresa, técnico ou especialidade..."
                  className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2.5 font-semibold text-sm outline-none text-zinc-900 dark:text-zinc-55 placeholder:text-zinc-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories scroll & Filtering Toolbar Container */}
      <section className="container mx-auto max-w-7xl px-6 py-10 space-y-6">
        <CategoryScroll
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Advanced Horizontal Filtering Toolbar */}
        <div className="flex flex-col gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]/80 rounded-2xl shadow-sm z-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left Section: Core Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Geolocation Button */}
              <button
                onClick={handleGeoActivate}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  geoEnabled
                    ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <MapPin size={13} className={geoEnabled ? 'animate-bounce' : ''} />
                {geoEnabled ? 'Localização Ativa' : 'Buscar Próximos'}
              </button>

              {/* Geolocation Radius Slider */}
              {geoEnabled && (
                <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 py-1.5 px-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-zinc-400 whitespace-nowrap">
                    Raio: {radius} km
                  </span>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-20 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}

              {/* Profile Type Select dropdown */}
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 gap-1.5">
                <Building2 size={13} className="text-zinc-400" />
                <select
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value as any)}
                  className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="all" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Qualquer Perfil</option>
                  <option value="technician" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Técnico Autônomo</option>
                  <option value="company" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Empresa Prestadora</option>
                </select>
              </div>

              {/* Price Range Select dropdown */}
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 gap-1.5">
                <DollarSign size={13} className="text-zinc-400" />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="all" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Faixa de Custo</option>
                  <option value="eco" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Econômico (≤ R$100/h)</option>
                  <option value="mid" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Médio (R$100-180/h)</option>
                  <option value="premium" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Corporate (&gt; R$180/h)</option>
                </select>
              </div>

              {/* Min rating select dropdown */}
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 gap-1.5">
                <Star size={13} className="text-zinc-400" />
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer focus:ring-0"
                >
                  <option value="0" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">Qualquer Avaliação</option>
                  <option value="4" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">⭐ 4.0+</option>
                  <option value="4.5" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">⭐ 4.5+</option>
                  <option value="5" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">⭐ 5.0</option>
                </select>
              </div>
            </div>

            {/* Right Section: Compliance Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 border-zinc-200 dark:border-zinc-850 pt-3 lg:pt-0 shrink-0">
              {/* KYC Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-850 dark:group-hover:text-zinc-200 transition-colors">
                  Apenas Verificados
                </span>
              </label>

              {/* Invoice Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={onlyNF}
                  onChange={(e) => setOnlyNF(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-850 dark:group-hover:text-zinc-200 transition-colors flex items-center gap-1">
                  <FileText size={12} className="text-zinc-500" /> Emite Nota Fiscal (B2B)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Grid - Extended to span full width (Span 12 cols, grid of 4) */}
        <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
              {displayedProfessionals?.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.03] transition-all duration-300 flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-start justify-between mb-6">
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

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-zinc-400 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-indigo-500/80" /> {p.city}, {p.state}
                      </span>
                      {geoEnabled && (p as any).distance !== undefined && (
                        <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px] bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                          a {((p as any).distance as number).toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {p.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[9px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-450"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 line-clamp-2 font-medium italic">
                      "{p.bio || 'Profissional dedicado e comprometido com a qualidade.'}"
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between shrink-0">
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-semibold text-zinc-400 uppercase">
                        {p.userType === 'company' ? 'Empresa Prestadora' : 'Técnico Autônomo'}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={11} /> Disponível
                      </span>
                    </div>
                    <Link
                      href={isLoggedIn ? `/profile/${p.id}` : `/register`}
                      className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-400 flex items-center gap-1 hover:gap-1.5 transition-all"
                    >
                      Ver Perfil <ArrowRight size={11} />
                    </Link>
                  </div>
                </motion.div>
              ))}

              {/* Locked State Banner overlay - client only if not logged in */}
              {!isLoggedIn && filteredProfessionals && filteredProfessionals.length > 2 && (
                <div className="col-span-full mt-4 relative">
                  {/* Glowing light overlay */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-10 pointer-events-none z-0" />

                  <div className="relative z-10 bg-white/95 dark:bg-[#0c0c0e]/95 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-md">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/5 mx-auto">
                      <Search size={24} />
                    </div>

                    <div className="max-w-xl mx-auto space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Quer Encontrar a{' '}
                        <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                          Elite dos Especialistas
                        </span>
                        ?
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        Cadastre-se gratuitamente no TechFix para desbloquear a lista completa de
                        mais de 15.000 profissionais certificados perto de você, contatar técnicos
                        em tempo real por chat e gerar diagnósticos inteligentes de chamado.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto pt-4">
                      <Link
                        href="/register"
                        className="w-full sm:flex-1 rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all hover:bg-zinc-850 dark:hover:bg-zinc-200 text-center"
                      >
                        Criar Conta Grátis
                      </Link>
                      <Link
                        href="/login"
                        className="w-full sm:flex-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800 text-center"
                      >
                        Entrar na Conta
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {filteredProfessionals?.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Briefcase size={40} className="mx-auto opacity-10" />
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-zinc-500 font-medium text-xs">
                    Tente ajustar seus filtros ou busca.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
