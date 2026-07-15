'use client';

import { useState } from 'react';
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
  Zap,
  Clock,
  Bell,
  ArrowUpRight,
  Briefcase,
  Plus,
  Home,
  FileText,
  DollarSign,
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
    queryFn: () =>
      apiGet<{ data: Ticket[] }>(
        userType === 'client' ? '/tickets' : '/tickets/my-jobs'
      ),
    enabled: !!token,
  });

  const myProposalsQuery = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => apiGet<{ data: any[] }>('/tickets/my-proposals'),
    enabled: !!token && (userType === 'technician' || userType === 'company'),
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<UserProfile>('/users/me'),
    enabled: !!token,
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<any[]>('/notifications'),
    enabled: !!token,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Query for In-Dashboard Search results
  const searchProfessionalsQuery = useQuery({
    queryKey: [
      'search-professionals-dashboard',
      activeCategory,
      geoEnabled,
      lat,
      lng,
      radius,
    ],
    queryFn: async () => {
      if (!activeSearch && !activeCategory) return [];

      if (geoEnabled && lat && lng) {
        return apiGet<Professional[]>(
          `/users/search?lat=${lat}&lng=${lng}&radius=${radius}`
        );
      }

      const res = await apiGet<{ data: Professional[] }>(
        `/users/professionals${
          activeCategory ? `?category=${encodeURIComponent(activeCategory)}` : ''
        }`
      );
      return res?.data || [];
    },
    enabled: !!activeSearch || !!activeCategory,
  });

  const tickets = ticketsQuery.data?.data || [];
  const profile = profileQuery.data;
  const isInactiveProfessional =
    (userType === 'technician' || userType === 'company') &&
    !profile?.subscriptionActive;

  const searchProfessionals = searchProfessionalsQuery.data || [];
  const isSearchLoading = searchProfessionalsQuery.isLoading;

  const filteredSearchProfessionals = searchProfessionals.filter((p) => {
    const matchesSearch =
      !activeSearch ||
      p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      p.specialties?.some((s) => s.toLowerCase().includes(activeSearch.toLowerCase()));
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
          alert(
            'Erro ao obter sua localização. Certifique-se de permitir o acesso nas configurações do navegador.'
          );
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
          <h1 className="text-2xl font-bold tracking-tight">Acesso Restrito</h1>
          <p className="text-zinc-500">Faça login para acessar seu painel de comando.</p>
          <Link href="/login" className="btn-primary inline-flex px-10 py-3">
            Entrar agora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-zinc-50 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 overflow-hidden pb-32 lg:pb-24">
      {/* Background ambient glowing shapes */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[500px] w-[500px] bg-violet-500/[0.02] dark:bg-violet-500/[0.01] rounded-full blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-16 relative z-10 space-y-12">
        {/* Inactive subscription card redesing */}
        {isInactiveProfessional && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.02] p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-6 text-left">
              <div className="h-11 w-11 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-center justify-center text-rose-500 shrink-0">
                <Zap size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Assinatura Inativa
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Sua conta de parceiro está pausada no marketplace. Ative o plano profissional para
                  voltar a receber propostas e orçamentos de novos clientes.
                </p>
              </div>
            </div>
            <Link
              href="/subscription"
              className="rounded-full bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 shrink-0 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all shadow-sm"
            >
              Ativar Plano Pro
            </Link>
          </motion.div>
        )}

        {/* Welcome Hero Panel */}
        <section>
          <DashboardHero
            userType={userType as string}
            profile={profile}
            ticketsCount={tickets.length}
            notificationsCount={
              notificationsQuery.data?.filter((n: any) => !n.read).length || 0
            }
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

        {/* Internal Search mode */}
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

        {/* Normal Dashboard mode */}
        {!isSearching && (
          <div className="space-y-12">
            {/* Quick Actions Shortcuts */}
            <DashboardQuickActions userType={userType as string} />

            {/* Potential Job opportunities list (For Technicians / Companies) */}
            {(userType === 'technician' || userType === 'company') && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-left">
                    Serviços em{' '}
                    <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                      Potencial
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!myProposalsQuery.data?.data || myProposalsQuery.data.data.length === 0 ? (
                    <div className="col-span-full border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                        <FileText size={18} />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">
                        Nenhuma proposta ativa
                      </h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        Envie orçamentos no marketplace para conquistar novos clientes.
                      </p>
                    </div>
                  ) : (
                    myProposalsQuery.data.data.map((proposal) => (
                      <Link
                        href={`/tickets/${proposal.ticket.id}`}
                        key={proposal.id}
                        className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/50 dark:hover:border-indigo-500/30 transition-all duration-300 group shadow-sm"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors line-clamp-2">
                              {proposal.ticket.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[9px] font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
                              {proposal.ticket.category || 'Geral'}
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 italic">
                              "{proposal.message}"
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                              <DollarSign size={13} />
                              R$ {Number(proposal.estimatedValue).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                              proposal.status === 'pending'
                                ? 'bg-amber-500/5 border border-amber-500/10 text-amber-500'
                                : proposal.status === 'accepted'
                                ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/5 border border-rose-500/10 text-rose-500'
                            }`}
                          >
                            {proposal.status === 'pending'
                              ? 'Aguardando'
                              : proposal.status === 'accepted'
                              ? 'Aceito'
                              : 'Recusado'}
                          </span>
                          <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                            Visualizar <ArrowRight size={10} />
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Active Tickets manager list */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-left">
                  {userType === 'client' ? 'Gerenciador de ' : 'Meus '}
                  <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {userType === 'client' ? 'Chamados' : 'Serviços Ativos'}
                  </span>
                </h2>
                <Link
                  href="/tickets"
                  className="text-xs font-semibold uppercase tracking-wider text-zinc-450 hover:text-indigo-500 transition-colors"
                >
                  Ver tudo
                </Link>
              </div>

              <div className="space-y-4 w-full">
                {tickets.length === 0 ? (
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl p-12 text-center w-full flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-400 flex items-center justify-center mb-6">
                      <ClipboardList size={22} />
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-2">
                      Seu gerenciador está limpo
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-xs leading-relaxed mb-6">
                      {userType === 'client'
                        ? 'Você não possui nenhum chamado aberto ou em andamento. Quando precisar de um serviço técnico, solicite por aqui!'
                        : 'Você não possui nenhum serviço ativo atribuído a você no momento.'}
                    </p>
                    {userType === 'client' && (
                      <Link
                        href="/tickets/new"
                        className="rounded-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-6 py-2.5 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all shadow-sm"
                      >
                        Solicitar Novo Serviço
                      </Link>
                    )}
                  </div>
                ) : (
                  tickets.slice(0, 5).map((ticket, idx) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-indigo-500/40 dark:hover:border-indigo-500/20 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-all duration-300 group gap-4 w-full"
                    >
                      <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 items-center justify-center text-zinc-500 group-hover:bg-indigo-500/5 group-hover:text-indigo-500 group-hover:border-indigo-500/10 transition-colors shrink-0">
                          <ClipboardList size={18} />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                              {ticket.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[9px] font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
                              {ticket.category || 'Geral'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />{' '}
                              {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-zinc-350 dark:bg-zinc-700 shrink-0" />
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                                ticket.status === 'open'
                                  ? 'bg-amber-500/5 border-amber-500/10 text-amber-500'
                                  : ticket.status === 'quoted'
                                  ? 'bg-purple-500/5 border-purple-500/10 text-purple-500'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500'
                                  : ticket.status === 'resolved'
                                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'
                                  : 'bg-zinc-500/5 border-zinc-550/10 text-zinc-500'
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse shrink-0" />
                              {ticket.status === 'open'
                                ? 'Aberto'
                                : ticket.status === 'quoted'
                                ? 'Orçado'
                                : ticket.status === 'in_progress'
                                ? 'Em Andamento'
                                : ticket.status === 'resolved'
                                ? 'Resolvido'
                                : ticket.status === 'closed'
                                ? 'Fechado'
                                : ticket.status === 'cancelled'
                                ? 'Cancelado'
                                : ticket.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center justify-end gap-2 border-t border-zinc-200/80 dark:border-zinc-800/60 sm:border-none pt-4 sm:pt-0 shrink-0">
                        {ticket.assignedToId && (
                          <Link
                            href={`/tickets/${ticket.id}/chat`}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          >
                            <MessageSquare size={11} /> Chat
                          </Link>
                        )}
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm"
                        >
                          Gerenciar <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Notifications list */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 text-left pl-1">
                Notificações Recentes
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pr-1">
                {notificationsQuery.isLoading && (
                  <div className="col-span-full h-20 w-full animate-pulse bg-zinc-200 dark:bg-zinc-900/60 rounded-2xl" />
                )}
                {notificationsQuery.data?.length === 0 && (
                  <div className="col-span-full border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                    <Bell size={20} className="mb-2 text-zinc-400 opacity-30" />
                    <p className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                      Sem alertas pendentes! ✨
                    </p>
                  </div>
                )}
                {notificationsQuery.data?.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`border-l-4 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800/80 relative overflow-hidden transition-all duration-300 text-left shadow-sm ${
                      n.read
                        ? 'border-l-zinc-300 dark:border-l-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/20'
                        : 'border-l-indigo-500 bg-white dark:bg-[#0c0c0e]/85'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white leading-tight">
                        {n.title}
                      </h5>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
                      {n.message}
                    </p>
                    {!n.read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(n.id)}
                        disabled={markAsReadMutation.isPending}
                        className="mt-3 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider hover:underline transition-all disabled:opacity-50"
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

      {/* Floating Bottom Nav (Mobile Viewports Only) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white/80 dark:bg-[#0c0c0e]/85 backdrop-blur-lg border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-full shadow-2xl flex items-center justify-between relative">
          <Link
            href="/dashboard"
            className="flex flex-col items-center text-indigo-500 dark:text-indigo-400 transition-colors"
          >
            <Home size={16} />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5">Início</span>
            <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-indigo-500" />
          </Link>

          <Link
            href="/companies"
            className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <Search size={16} />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5">Buscar</span>
          </Link>

          {/* Centered focal CTA (+ / Briefcase) */}
          {userType === 'client' ? (
            <Link
              href="/tickets/new"
              className="h-11 w-11 rounded-full bg-zinc-950 dark:bg-zinc-50 hover:opacity-90 text-white dark:text-zinc-950 flex items-center justify-center -mt-8 shadow-xl border-4 border-zinc-150 dark:border-[#07070a] transition-all transform active:scale-95 shrink-0"
            >
              <Plus size={20} />
            </Link>
          ) : (
            <Link
              href="/opportunities"
              className="h-11 w-11 rounded-full bg-zinc-950 dark:bg-zinc-50 hover:opacity-90 text-white dark:text-zinc-950 flex items-center justify-center -mt-8 shadow-xl border-4 border-zinc-150 dark:border-[#07070a] transition-all transform active:scale-95 shrink-0"
            >
              <Briefcase size={16} />
            </Link>
          )}

          <Link
            href={userType === 'client' ? '/tickets' : '/opportunities'}
            className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <Briefcase size={16} />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5">
              {userType === 'client' ? 'Chamados' : 'Vagas'}
            </span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <User size={16} />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1.5">Perfil</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
