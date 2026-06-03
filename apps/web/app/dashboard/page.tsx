'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSessionStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api/client';
import { SkeletonCard } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DashboardSearch } from '@/components/dashboard/dashboard-search';
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions';
import { DashboardSearchResults } from '@/components/dashboard/dashboard-search-results';

import { 
  PlusCircle, 
  Search, 
  ClipboardList, 
  MessageSquare, 
  ArrowRight,
  User,
  Star,
  Zap,
  Wallet,
  Clock,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  Brain,
  Home,
  Briefcase,
  Plus,
  ShieldCheck,
  Sparkles,
  Filter,
  MapPin,
  DollarSign,
  FileText
} from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { UserProfile, Professional } from '@/types/user';

const QUICK_CATEGORIES = [
  { label: 'Ar Condicionado', category: 'Ar Condicionado' },
  { label: 'Elétrica', category: 'Elétrica' },
  { label: 'Hidráulica', category: 'Hidráulica' },
  { label: 'Limpeza', category: 'Limpeza' },
  { label: 'Reformas', category: 'Reformas' },
];

export default function DashboardPage() {
  const { userType, token } = useSessionStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search and Suggestion States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Advanced Filters for In-Dashboard Search
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(20);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  
  const ticketsQuery = useQuery({
    queryKey: ['dashboard-tickets', userType],
    queryFn: () => apiGet<{ data: Ticket[] }>(userType === 'client' ? '/tickets' : '/tickets/my-jobs'),
    enabled: !!token
  });

  const myProposalsQuery = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => apiGet<{ data: any[] }>('/tickets/my-proposals'),
    enabled: !!token && (userType === 'technician' || userType === 'company')
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<UserProfile>('/users/me'),
    enabled: !!token
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<any[]>('/notifications'),
    enabled: !!token
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Query for In-Dashboard Search results
  const searchProfessionalsQuery = useQuery({
    queryKey: ['search-professionals-dashboard', activeCategory, geoEnabled, lat, lng, radius],
    queryFn: async () => {
      if (!activeSearch && !activeCategory) return [];
      
      if (geoEnabled && lat && lng) {
        return apiGet<Professional[]>(`/users/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      }
      
      const res = await apiGet<{ data: Professional[] }>(
        `/users/professionals${activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''}`
      );
      return res?.data || [];
    },
    enabled: !!activeSearch || !!activeCategory
  });

  const tickets = ticketsQuery.data?.data || [];
  const profile = profileQuery.data;
  const isInactiveProfessional = (userType === 'technician' || userType === 'company') && !profile?.subscriptionActive;

  const searchProfessionals = searchProfessionalsQuery.data || [];
  const isSearchLoading = searchProfessionalsQuery.isLoading;

  const filteredSearchProfessionals = searchProfessionals.filter(p => {
    const matchesSearch = !activeSearch || p.name.toLowerCase().includes(activeSearch.toLowerCase()) || p.specialties?.some(s => s.toLowerCase().includes(activeSearch.toLowerCase()));
    const matchesVerified = !onlyVerified || p.kycStatus === 'approved' || p.livenessVerified;
    const matchesRating = !minRating || (p.rating && p.rating >= minRating);
    const matchesCategory = !activeCategory || p.specialties?.includes(activeCategory);

    return matchesSearch && matchesVerified && matchesRating && matchesCategory;
  });

  const isSearching = activeSearch !== null || activeCategory !== null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setActiveCategory(null);
    }
  };

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

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-500">Faça login para acessar seu painel de comando.</p>
          <Link href="/login" className="btn-primary inline-flex px-10 py-3">Entrar agora</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden pb-32 lg:pb-24">
      
      {/* Luzes de Fundo (Glow Backgrounds) - visual premium */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[500px] w-[500px] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 relative z-10 space-y-12">
        
        {isInactiveProfessional && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2.5rem] border border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl animate-pulse"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 shrink-0 shadow-lg">
                <Zap size={28} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">Assinatura Inativa</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Sua conta de parceiro está pausada no marketplace. Ative o plano profissional para voltar a receber propostas e orçamentos.
                </p>
              </div>
            </div>
            <Link href="/subscription" className="btn-primary px-10 py-4 shrink-0 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:bg-red-600 bg-red-500 border-none font-bold text-xs uppercase tracking-widest">
              Ativar Plano Pro
            </Link>
          </motion.div>
        )}

        {/* Welcome Hero Section com Métricas Integradas */}
        <section>
          <DashboardHero
            userType={userType as string}
            profile={profile}
            ticketsCount={tickets.length}
            notificationsCount={notificationsQuery.data?.filter((n: any) => !n.read).length || 0}
          >
            <DashboardSearch
              userType={userType as string}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearchSubmit={handleSearchSubmit}
              setActiveCategory={setActiveCategory}
              setActiveSearch={setActiveSearch}
              quickCategories={QUICK_CATEGORIES}
            />
          </DashboardHero>
        </section>

        {/* MODO BUSCA INTERNA: Exibe os resultados diretamente na tela do Dashboard */}
        <DashboardSearchResults
          isSearching={isSearching}
          activeSearch={activeSearch}
          activeCategory={activeCategory}
          setActiveSearch={setActiveSearch}
          setActiveCategory={setActiveCategory}
          setSearchQuery={setSearchQuery}
          geoEnabled={geoEnabled}
          handleGeoActivate={handleGeoActivate}
          radius={radius}
          setRadius={setRadius}
          onlyVerified={onlyVerified}
          setOnlyVerified={setOnlyVerified}
          minRating={minRating}
          setMinRating={setMinRating}
          isSearchLoading={isSearchLoading}
          filteredSearchProfessionals={filteredSearchProfessionals as any}
        />

        {/* MODO NORMAL: Exibe atalhos, gerenciador de chamados completo e notificações */}
        {!isSearching && (
          <div className="space-y-12">
            
            {/* Atalhos Rápidos */}
            <DashboardQuickActions userType={userType as string} />

            {/* Serviços em Potencial (Propostas Enviadas - Apenas para Técnicos) */}
            {(userType === 'technician' || userType === 'company') && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-left">
                    Serviços em <span className="premium-gradient-text">Potencial</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!myProposalsQuery.data?.data || myProposalsQuery.data.data.length === 0 ? (
                    <div className="col-span-full glass-card p-8 text-center border border-dashed border-slate-200/80 dark:border-white/10 bg-slate-100/20 dark:bg-white/[0.01]">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400 mb-4">
                        <FileText size={20} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Nenhuma proposta ativa</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Envie orçamentos no marketplace para conquistar novos clientes.</p>
                    </div>
                  ) : (
                    myProposalsQuery.data.data.map((proposal) => (
                      <Link href={`/tickets/${proposal.ticket.id}`} key={proposal.id} className="glass-card p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all group">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2">{proposal.ticket.title}</h4>
                            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                              {proposal.ticket.category || 'Geral'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 italic">
                              "{proposal.message}"
                            </p>
                            <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 mt-2">
                              <DollarSign size={14} /> 
                              R$ {Number(proposal.estimatedValue).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                            proposal.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                            proposal.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                            'bg-rose-500/10 text-rose-500'
                          }`}>
                            {proposal.status === 'pending' ? 'Aguardando' : 
                             proposal.status === 'accepted' ? 'Aceito' : 'Recusado'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                            Visualizar <ArrowRight size={10} />
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Gerenciador de Chamados (Largura Total - 12 Colunas!) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-left">
                  {userType === 'client' ? 'Gerenciador de ' : 'Meus '}
                  <span className="premium-gradient-text">{userType === 'client' ? 'Chamados' : 'Serviços Ativos'}</span>
                </h2>
                <Link href="/tickets" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Ver tudo</Link>
              </div>

              <div className="space-y-4 w-full">
                {tickets.length === 0 ? (
                  <div className="glass-card p-12 text-center border border-dashed border-slate-200/80 dark:border-white/10 relative overflow-hidden bg-slate-100/20 dark:bg-white/[0.01] w-full">
                    {/* Glowing ring background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
                      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                        <ClipboardList size={28} />
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">Seu gerenciador está limpo</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                        {userType === 'client' 
                          ? 'Você não possui nenhum chamado aberto ou em andamento. Quando precisar de um serviço técnico, solicite por aqui!' 
                          : 'Você não possui nenhum serviço ativo atribuído a você no momento.'}
                      </p>
                      {userType === 'client' && (
                        <Link href="/tickets/new" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35">
                          <PlusCircle size={14} /> Solicitar Novo Serviço
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  tickets.slice(0, 5).map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-100 dark:hover:bg-white/[0.01] transition-all group gap-4 border border-slate-200/60 dark:border-white/5 w-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 items-center justify-center text-slate-500 group-hover:bg-blue-600/10 group-hover:text-blue-600 group-hover:border-blue-500/20 transition-colors shrink-0">
                          <ClipboardList size={22} />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{ticket.title}</h4>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                              {ticket.category || 'Geral'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></div>
                            <span className={`font-black px-2 py-0.5 rounded-md text-[9px] ${
                              ticket.status === 'open' ? 'bg-amber-500/10 text-amber-500' :
                              ticket.status === 'quoted' ? 'bg-purple-500/10 text-purple-500' :
                              ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                              ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {ticket.status === 'open' ? 'Aberto' : 
                               ticket.status === 'quoted' ? 'Orçado' : 
                               ticket.status === 'in_progress' ? 'Em Andamento' : 
                               ticket.status === 'resolved' ? 'Resolvido' : 
                               ticket.status === 'closed' ? 'Fechado' : 
                               ticket.status === 'cancelled' ? 'Cancelado' : ticket.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/5 sm:border-none pt-4 sm:pt-0 shrink-0">
                        {ticket.assignedToId && (
                          <Link href={`/tickets/${ticket.id}/chat`} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all">
                            <MessageSquare size={12} /> Chat
                          </Link>
                        )}
                        <Link href={`/tickets/${ticket.id}`} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                          Gerenciar <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Notificações Recentes (Largura Total em Grid Otimizado) */}
            <section className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left">Notificações Recentes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pr-1">
                {notificationsQuery.isLoading && <div className="col-span-full h-20 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl" />}
                {notificationsQuery.data?.length === 0 && (
                  <div className="col-span-full glass-card p-8 text-center text-slate-400 border border-dashed border-slate-200/60 dark:border-white/10 bg-slate-100/10 dark:bg-white/[0.01]">
                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                    <p className="font-bold text-xs uppercase tracking-wider">Sem alertas pendentes! ✨</p>
                  </div>
                )}
                {notificationsQuery.data?.slice(0, 4).map((n) => (
                  <div 
                    key={n.id} 
                    className={`glass-card p-5 border-l-4 relative overflow-hidden transition-all duration-300 text-left ${
                      n.read 
                        ? 'border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.01]' 
                        : 'border-blue-500 bg-blue-500/[0.01] dark:bg-blue-500/[0.02]'
                    }`}
                  >
                     <div className="flex justify-between items-start mb-2 gap-2">
                        <h5 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white leading-tight">{n.title}</h5>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{n.message}</p>
                     {!n.read && (
                        <button 
                          onClick={() => markAsReadMutation.mutate(n.id)}
                          disabled={markAsReadMutation.isPending}
                          className="mt-3 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline transition-all disabled:opacity-50"
                        >
                          {markAsReadMutation.isPending ? 'Marcando...' : 'Marcar como lida'}
                        </button>
                     )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

      </div>

      {/* Floating Mobile Bottom Navigation Bar (Exclusivo para Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white/90 dark:bg-black/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-full px-6 py-3 shadow-2xl flex items-center justify-between relative">
          
          <Link href="/dashboard" className="flex flex-col items-center text-blue-600 dark:text-blue-400 transition-colors">
            <Home size={18} />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5">Início</span>
            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500"></span>
          </Link>
          
          <Link href="/companies" className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <Search size={18} />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5">Buscar</span>
          </Link>
          
          {/* Botão de Destaque central (+) */}
          {userType === 'client' ? (
            <Link href="/tickets/new" className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center -mt-8 shadow-xl shadow-blue-500/35 border-4 border-white dark:border-[#07070c] transition-all transform active:scale-95 shrink-0">
              <Plus size={24} />
            </Link>
          ) : (
            <Link href="/opportunities" className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center -mt-8 shadow-xl shadow-blue-500/35 border-4 border-white dark:border-[#07070c] transition-all transform active:scale-95 shrink-0">
              <Briefcase size={20} />
            </Link>
          )}
          
          <Link href={userType === 'client' ? '/tickets' : '/opportunities'} className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <Briefcase size={18} />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5">
              {userType === 'client' ? 'Chamados' : 'Vagas'}
            </span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <User size={18} />
            <span className="text-[8px] font-black uppercase tracking-wider mt-1.5">Perfil</span>
          </Link>
        </div>
      </div>
      
    </main>
  );
}
