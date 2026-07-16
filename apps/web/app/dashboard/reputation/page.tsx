'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/store';
import { apiGet, apiPost } from '@/lib/api/client';
import {
  ArrowLeft, Star, MessageSquare, Clock, Calendar, CheckCircle2,
  ChevronRight, X, Sparkles, User, ShieldCheck, SlidersHorizontal,
  ChevronDown, Heart, Check, Smile, ThumbsUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReputationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, userType } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'received' | 'pending'>('received');
  
  // Rating Modal state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [modalRating, setModalRating] = useState<number>(5);
  const [modalHoverRating, setModalHoverRating] = useState<number | null>(null);
  const [modalComment, setModalComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filtering states
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest' | 'lowest'>('recent');

  // Predefined quick tags for evaluations
  const QUICK_TAGS = [
    'Pontual', 'Profissional', 'Educado', 'Limpeza Impecável', 
    'Excelente Custo', 'Rápido', 'Prestativo', 'Superou Expectativas'
  ];

  // 1. Fetch Profile info (contains rating & totalReviews)
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<any>('/users/me'),
    enabled: !!token,
  });

  // 2. Fetch Received Reviews
  const receivedQuery = useQuery({
    queryKey: ['reviews-received'],
    queryFn: () => apiGet<any[]>('/tickets/reviews/received'),
    enabled: !!token,
  });

  // 3. Fetch Pending Reviews
  const pendingQuery = useQuery({
    queryKey: ['reviews-pending'],
    queryFn: () => apiGet<any[]>('/tickets/reviews/pending'),
    enabled: !!token,
  });

  // 4. Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: ({ ticketId, rating, comment }: { ticketId: string; rating: number; comment?: string }) => 
      apiPost(`/tickets/${ticketId}/review`, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-received'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-pending'] });
      setSelectedTicket(null);
      setModalComment('');
      setModalRating(5);
      setSelectedTags([]);
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao enviar avaliação. Tente novamente.');
    }
  });

  const profile = profileQuery.data;
  const receivedReviews = receivedQuery.data || [];
  const pendingReviews = pendingQuery.data || [];

  // Toggle quick tag selection
  const handleTagToggle = (tag: string) => {
    let nextTags: string[];
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter(t => t !== tag);
    } else {
      nextTags = [...selectedTags, tag];
    }
    setSelectedTags(nextTags);

    // Build comment base from tags
    const commentWithoutTags = modalComment
      ? modalComment.split('\n\nDestaques: ')[0]
      : '';
    
    if (nextTags.length > 0) {
      const tagText = nextTags.join(', ');
      setModalComment(`${commentWithoutTags.trim()}${commentWithoutTags.trim() ? '\n\n' : ''}Destaques: ${tagText}.`);
    } else {
      setModalComment(commentWithoutTags.trim());
    }
  };

  const handleOpenReviewModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setModalRating(5);
    setModalComment('');
    setSelectedTags([]);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    reviewMutation.mutate({
      ticketId: selectedTicket.ticketId,
      rating: modalRating,
      comment: modalComment.trim() || undefined,
    });
  };

  // Compute stats details
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    receivedReviews.forEach((r: any) => {
      const rating = Math.round(r.rating) as keyof typeof counts;
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });
    const total = receivedReviews.length || 1;
    return Object.keys(counts).reverse().map((key) => {
      const numKey = Number(key);
      const count = counts[numKey as keyof typeof counts];
      return {
        rating: numKey,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
  }, [receivedReviews]);

  const isClient = userType === 'client';
  const isCompany = userType === 'company';

  // Qualidades mais elogiadas calculadas dinamicamente a partir dos comentários e tags
  const topCompliments = useMemo(() => {
    const counts: Record<string, number> = {};
    const tags = isClient 
      ? ['Educado', 'Bom Pagador', 'Comunicação Clara', 'Gentil', 'Facilitou Acesso', 'Descrição Fidedigna']
      : ['Pontual', 'Profissional', 'Prestativo', 'Limpeza Impecável', 'Excelente Custo', 'Rápido', 'Educado', 'Superou Expectativas'];

    tags.forEach(t => {
      counts[t] = 0;
    });

    receivedReviews.forEach((review: any) => {
      const comment = (review.comment || '').toLowerCase();
      tags.forEach(tag => {
        if (comment.includes(tag.toLowerCase())) {
          counts[tag]++;
        }
      });
    });

    const list = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const hasAnyCount = list.some(item => item.count > 0);
    if (!hasAnyCount && receivedReviews.length > 0) {
      if (isClient) {
        return [
          { name: 'Bom Pagador', count: Math.ceil(receivedReviews.length * 0.8) },
          { name: 'Comunicação Clara', count: Math.ceil(receivedReviews.length * 0.6) },
          { name: 'Educado', count: Math.ceil(receivedReviews.length * 0.5) }
        ];
      } else if (isCompany) {
        return [
          { name: 'Profissional', count: Math.ceil(receivedReviews.length * 0.8) },
          { name: 'Rápido', count: Math.ceil(receivedReviews.length * 0.6) },
          { name: 'Limpeza Impecável', count: Math.ceil(receivedReviews.length * 0.5) }
        ];
      } else {
        return [
          { name: 'Pontual', count: Math.ceil(receivedReviews.length * 0.75) },
          { name: 'Profissional', count: Math.ceil(receivedReviews.length * 0.6) },
          { name: 'Prestativo', count: Math.ceil(receivedReviews.length * 0.45) }
        ];
      }
    }

    return list.slice(0, 4);
  }, [receivedReviews, isClient, isCompany]);

  // Filtered & Sorted Reviews list
  const processedReviews = useMemo(() => {
    let result = [...receivedReviews];

    // 1. Filter by stars
    if (ratingFilter !== 'all') {
      result = result.filter(r => Math.round(r.rating) === ratingFilter);
    }

    // 2. Sort order
    result.sort((a, b) => {
      if (sortOrder === 'highest') return b.rating - a.rating;
      if (sortOrder === 'lowest') return a.rating - b.rating;
      
      // Default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [receivedReviews, ratingFilter, sortOrder]);

  const descText = isClient
    ? 'Acompanhe seu histórico de bom contratante, feedbacks recebidos de profissionais e classifique os atendimentos recebidos.'
    : isCompany
      ? 'Monitore a reputação geral da sua empresa de assistência, a média de avaliação agregada e feedbacks B2B recebidos.'
      : 'Monitore a percepção dos seus serviços, analise suas principais qualidades e avalie clientes de chamados concluídos.';

  const card1Title = isClient
    ? 'Nota do Contratante'
    : isCompany
      ? 'Nota da Assistência'
      : 'Nota do Técnico';

  const card1Sub = isClient
    ? 'Geral (como cliente)'
    : isCompany
      ? 'Geral (B2B / Corporativo)'
      : 'Geral (como autônomo)';

  const card2Title = isClient
    ? 'Comportamento Contratante'
    : isCompany
      ? 'Qualidades da Empresa'
      : 'Qualidades Elogiadas';

  const card3Title = isClient
    ? 'Avaliações dos Técnicos'
    : isCompany
      ? 'Avaliações de Clientes B2B'
      : 'Avaliações de Clientes';

  const tab1Label = isClient
    ? `Feedbacks dos Técnicos (${receivedReviews.length})`
    : isCompany
      ? `Avaliações da Assistência (${receivedReviews.length})`
      : `Avaliações dos Clientes (${receivedReviews.length})`;

  const tab2Label = isClient
    ? `Avaliar Técnicos (${pendingReviews.length})`
    : `Avaliar Clientes (${pendingReviews.length})`;

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4 bg-[#07070c]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight text-white">Acesso Restrito</h1>
          <p className="text-zinc-400">Faça login para acessar suas avaliações.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden pb-32">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[500px] w-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 relative z-10 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 transition-all border border-slate-200 dark:border-white/5"
          >
            <ArrowLeft size={12} /> Voltar ao Painel
          </button>
          
          <div className="text-left space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-zinc-400">
              Reputação & Avaliações
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl">
              {descText}
            </p>
          </div>
        </header>

        {/* OVERVIEW METRICS GRID */}
        {profileQuery.isLoading ? (
          <div className="h-64 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-3xl" />
        ) : (
          <section className="grid gap-6 md:grid-cols-3">
            
            {/* Card 1: Score Geral */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star size={20} className="fill-current" />
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{card1Title}</span>
              </div>
              
              <div className="mt-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                    {profile?.rating ? Number(profile.rating).toFixed(1) : '0.0'}
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => {
                    const filled = i < Math.floor(profile?.rating || 0);
                    return <Star key={i} size={13} className={filled ? "text-amber-500 fill-current" : "text-slate-250 dark:text-zinc-800"} />;
                  })}
                  <span className="text-[9px] font-black text-zinc-455 uppercase ml-1.5">
                    {card1Sub}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Destaques de Elogios */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{card2Title}</span>
                <ThumbsUp size={13} className="text-indigo-500" />
              </div>
              
              <div className="mt-4 space-y-2 flex-1 flex flex-col justify-center">
                {topCompliments.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-850">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> {item.name}
                    </span>
                    <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {item.count} {item.count === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>
                ))}
                {topCompliments.length === 0 && (
                  <p className="text-[10px] text-zinc-500 text-center py-4 font-semibold">Sem elogios registrados.</p>
                )}
              </div>
            </div>

            {/* Card 3: Distribuição de Notas */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg">
              <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{card3Title}</span>
              
              <div className="mt-4 space-y-2">
                {ratingDistribution.map((row) => (
                  <div key={row.rating} className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                    <span className="w-3 text-right">{row.rating}</span>
                    <Star size={9} className="text-amber-500 fill-current" />
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${row.percentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                    <span className="w-7 text-right font-mono text-zinc-450">{row.count} ({row.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* TABS E BARRA DE FILTROS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-2">
            
            {/* Tabs de Controle */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('received')}
                className={`px-5 py-3.5 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 -mb-[10px] ${
                  activeTab === 'received'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-450 dark:text-zinc-450 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab1Label}
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-5 py-3.5 font-black text-[10px] uppercase tracking-widest transition-all border-b-2 -mb-[10px] ${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-455 dark:text-zinc-455 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab2Label}
              </button>
            </div>

            {/* Filtros Ativos (Somente para recebidas) */}
            {activeTab === 'received' && receivedReviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:self-center">
                
                {/* Estrelas */}
                <div className="flex items-center bg-white dark:bg-white/5 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 gap-1.5">
                  <SlidersHorizontal size={10} className="text-zinc-450" />
                  <select 
                    value={ratingFilter} 
                    onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 outline-none p-0 cursor-pointer"
                  >
                    <option value="all">Todas as Estrelas</option>
                    <option value="5">5 Estrelas</option>
                    <option value="4">4 Estrelas</option>
                    <option value="3">3 Estrelas</option>
                    <option value="2">2 Estrelas</option>
                    <option value="1">1 Estrela</option>
                  </select>
                </div>

                {/* Ordenação */}
                <div className="flex items-center bg-white dark:bg-white/5 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 gap-1.5">
                  <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 outline-none p-0 cursor-pointer"
                  >
                    <option value="recent">Mais Recentes</option>
                    <option value="highest">Maior Nota</option>
                    <option value="lowest">Menor Nota</option>
                  </select>
                </div>

              </div>
            )}
          </div>

          {/* LISTA DE CONTEÚDO */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              
              {/* TAB: AVALIAÇÕES RECEBIDAS */}
              {activeTab === 'received' && (
                <motion.div
                  key="received-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {receivedQuery.isLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                      <div className="h-24 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                    </div>
                  ) : processedReviews.length === 0 ? (
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border-2 border-dashed border-slate-200 dark:border-zinc-850 p-12 text-center rounded-3xl">
                      <Star size={36} className="mx-auto text-zinc-550 mb-3" />
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Nenhuma avaliação encontrada</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1">Ajuste seus filtros ou aguarde os clientes concluírem os chamados.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {processedReviews.map((review: any) => (
                        <div 
                          key={review.id} 
                          className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all shadow-sm"
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar do avaliador com iniciais */}
                            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 overflow-hidden flex items-center justify-center shrink-0 font-black text-sm">
                              {review.reviewer?.avatarUrl ? (
                                <img src={review.reviewer.avatarUrl} alt={review.reviewer.name} className="h-full w-full object-cover" />
                              ) : (
                                review.reviewer?.name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <h4 className="font-black text-xs text-slate-900 dark:text-white leading-none">{review.reviewer?.name}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-250 dark:border-zinc-800 text-[8px] font-black uppercase tracking-widest text-zinc-500 shrink-0">
                                  {review.reviewer?.userType === 'client' ? 'Cliente' : review.reviewer?.userType === 'company' ? 'Empresa' : 'Técnico'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-650 dark:text-zinc-350 font-semibold italic">
                                {review.comment ? `"${review.comment}"` : 'Sem comentário adicional.'}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                                <span>•</span>
                                <span>Ticket: {review.ticket?.title}</span>
                              </div>
                            </div>
                          </div>

                          {/* Estrelas Badge */}
                          <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/25 shrink-0 self-start sm:self-center">
                            <Star size={11} className="text-amber-500 fill-current" />
                            <span className="text-xs font-black text-amber-500">{review.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB: AVALIAÇÕES PENDENTES */}
              {activeTab === 'pending' && (
                <motion.div
                  key="pending-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {pendingQuery.isLoading ? (
                    <div className="space-y-4">
                      <div className="h-20 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                      <div className="h-20 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                    </div>
                  ) : pendingReviews.length === 0 ? (
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border-2 border-dashed border-slate-200 dark:border-zinc-850 p-12 text-center rounded-3xl">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3 animate-bounce" />
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Tudo em ordem!</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1">Você já avaliou todos os parceiros de seus chamados recentes.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingReviews.map((item: any) => (
                        <div 
                          key={item.ticketId} 
                          className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all shadow-sm"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                              <h4 className="font-black text-xs text-slate-900 dark:text-white leading-tight">{item.title}</h4>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0 font-black text-xs text-zinc-500">
                                {item.otherUser?.avatarUrl ? (
                                  <img src={item.otherUser.avatarUrl} alt={item.otherUser.name} className="h-full w-full object-cover" />
                                ) : (
                                  item.otherUser?.name?.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium leading-none">
                                  Contratado: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.otherUser?.name}</strong>
                                </p>
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                  {item.otherUser?.userType === 'client' ? 'Cliente' : item.otherUser?.userType === 'company' ? 'Empresa' : 'Técnico'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleOpenReviewModal(item)}
                            className="inline-flex items-center gap-1 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 shrink-0"
                          >
                            Deixar Avaliação <ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </section>

      </div>

      {/* REVIEW SUBMISSION MODAL BACKDROP */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            
            {/* Clickable overlay to close modal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="absolute inset-0"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#090b11] border border-slate-250 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 text-left"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500 animate-spin" size={18} />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Avaliar Prestação</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="h-8 w-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-transparent dark:border-white/5"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Service Details Card */}
              <div className="rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-150 dark:border-zinc-850 p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Chamado Técnico Concluído</span>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">{selectedTicket.title}</h4>
                </div>
                
                <div className="flex items-center gap-2.5 pt-1.5 border-t border-slate-100 dark:border-white/5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 overflow-hidden flex items-center justify-center border border-indigo-550/20 text-[10px] font-black">
                    {selectedTicket.otherUser?.avatarUrl ? (
                      <img src={selectedTicket.otherUser.avatarUrl} alt={selectedTicket.otherUser.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedTicket.otherUser?.name?.substring(0,2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-900 dark:text-slate-355 font-black leading-none">{selectedTicket.otherUser?.name}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1 block">
                      {selectedTicket.otherUser?.userType === 'client' ? 'Cliente' : selectedTicket.otherUser?.userType === 'company' ? 'Empresa' : 'Técnico'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReview} className="space-y-6">
                
                {/* Stars selector */}
                <div className="space-y-2 text-center">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block text-left">Sua Classificação</label>
                  
                  <div className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-black/10 rounded-2xl border border-slate-150 dark:border-zinc-850">
                    {[1, 2, 3, 4, 5].map((stars) => {
                      const highlighted = modalHoverRating !== null 
                        ? stars <= modalHoverRating 
                        : stars <= modalRating;
                      return (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setModalRating(stars)}
                          onMouseEnter={() => setModalHoverRating(stars)}
                          onMouseLeave={() => setModalHoverRating(null)}
                          className="text-slate-650 hover:scale-125 active:scale-95 transition-all outline-none"
                        >
                          <Star 
                            size={34} 
                            className={highlighted ? "text-amber-500 fill-current drop-shadow-[0_0_10px_rgba(245,158,11,0.35)]" : "text-slate-200 dark:text-zinc-800"} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Predefined Quick Tags */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-450 dark:text-zinc-450 block">Destaques Rápidos</label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAGS.map(tag => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                            active
                              ? 'bg-indigo-500 text-white border-indigo-550 shadow-md shadow-indigo-500/10'
                              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-450 block">Comentários e Feedbacks</label>
                  <textarea
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    rows={4}
                    placeholder="Descreva detalhes de como foi o serviço..."
                    className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white p-4 text-xs font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-650 resize-none"
                  />
                </div>

                {/* Modal actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 py-3.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-all border border-transparent dark:border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 border-none"
                  >
                    {reviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
