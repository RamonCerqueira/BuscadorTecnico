'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/store';
import { apiGet, apiPost } from '@/lib/api/client';
import { ArrowLeft, Star, MessageSquare, Clock, Calendar, CheckCircle2, ChevronRight, X, Sparkles, User, ShieldCheck } from 'lucide-react';
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
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao enviar avaliação. Tente novamente.');
    }
  });

  const profile = profileQuery.data;
  const receivedReviews = receivedQuery.data || [];
  const pendingReviews = pendingQuery.data || [];

  const handleOpenReviewModal = (ticket: any) => {
    setSelectedTicket(ticket);
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

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-500">Faça login para acessar suas avaliações.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden pb-32">
      {/* Glows Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[400px] w-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 relative z-10 space-y-10">
        
        {/* Header / Voltar */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-white/5"
          >
            <ArrowLeft size={14} /> Voltar para o Painel
          </button>
          
          <div className="text-left space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Reputação & <span className="premium-gradient-text">Avaliações</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Metrifique seu desempenho de serviços, acompanhe os depoimentos e avalie seus parceiros comerciais.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        {profileQuery.isLoading ? (
          <div className="h-32 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-[2rem]" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Nota Média Card */}
            <div className="glass-card p-6 flex flex-col justify-between border border-slate-200 dark:border-white/5 text-left relative overflow-hidden bg-white/50 dark:bg-white/[0.01]">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star size={20} className="fill-current" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota Média</span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-4xl font-black">{profile?.rating ? Number(profile.rating).toFixed(1) : '0.0'}</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => {
                    const filled = i < Math.floor(profile?.rating || 0);
                    return <Star key={i} size={12} className={filled ? "text-amber-500 fill-current" : "text-slate-300 dark:text-slate-700"} />;
                  })}
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Geral</span>
                </div>
              </div>
            </div>

            {/* Total de Feedbacks Card */}
            <div className="glass-card p-6 flex flex-col justify-between border border-slate-200 dark:border-white/5 text-left relative overflow-hidden bg-white/50 dark:bg-white/[0.01]">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comentários</span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-4xl font-black">{profile?.totalReviews || 0}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avaliações Recebidas</p>
              </div>
            </div>

            {/* Nível de Profissional Card */}
            <div className="glass-card p-6 flex flex-col justify-between border border-slate-200 dark:border-white/5 text-left relative overflow-hidden bg-white/50 dark:bg-white/[0.01]">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualidade</span>
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {profile?.rating >= 4.5 ? 'Excelente' : profile?.rating >= 3.0 ? 'Bom' : profile?.rating > 0 ? 'Regular' : 'Novo Membro'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {profile?.rating >= 4.5 ? 'Alto índice de aprovação' : 'Perfis de qualidade ativa'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tabs Control */}
        <div className="flex border-b border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'received'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5 sm:rounded-t-2xl'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Avaliações Recebidas ({receivedReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'pending'
                ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5 sm:rounded-t-2xl'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Avaliar Serviços Pendentes ({pendingReviews.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-6">
          {activeTab === 'received' ? (
            /* Received Reviews List */
            receivedQuery.isLoading ? (
              <div className="space-y-4">
                <div className="h-24 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl" />
                <div className="h-24 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl" />
              </div>
            ) : receivedReviews.length === 0 ? (
              <div className="glass-card p-12 text-center border border-dashed border-slate-200 dark:border-white/10 bg-slate-100/20 dark:bg-white/[0.01]">
                <Star size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-1">Nenhuma avaliação recebida</h4>
                <p className="text-xs text-slate-500 font-medium">As avaliações recebidas de seus parceiros de serviço aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedReviews.map((review: any) => (
                  <div key={review.id} className="glass-card p-5 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar do Avaliador */}
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 overflow-hidden shrink-0">
                        {review.reviewer?.avatarUrl ? (
                          <img src={review.reviewer.avatarUrl} alt={review.reviewer.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-black text-slate-400 dark:text-slate-600">{review.reviewer?.name?.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* Detalhes do comentário */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <h5 className="font-black text-sm text-slate-900 dark:text-white">{review.reviewer?.name}</h5>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                            {review.reviewer?.userType === 'client' ? 'Cliente' : review.reviewer?.userType === 'company' ? 'Empresa' : 'Técnico'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                          {review.comment ? `"${review.comment}"` : 'Sem comentários adicionais.'}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span>Ref: {review.ticket?.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nota Estrelas */}
                    <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/25 shrink-0 self-start sm:self-center">
                      <Star size={12} className="text-amber-500 fill-current" />
                      <span className="text-xs font-black text-amber-500">{review.rating}</span>
                    </div>

                  </div>
                ))}
              </div>
            )
          ) : (
            /* Pending Reviews List */
            pendingQuery.isLoading ? (
              <div className="space-y-4">
                <div className="h-20 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl" />
                <div className="h-20 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-2xl" />
              </div>
            ) : pendingReviews.length === 0 ? (
              <div className="glass-card p-12 text-center border border-dashed border-slate-200 dark:border-white/10 bg-slate-100/20 dark:bg-white/[0.01]">
                <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-4 animate-bounce" />
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-1">Tudo em dia!</h4>
                <p className="text-xs text-slate-500 font-medium">Você já avaliou todos os parceiros de chamados resolvidos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((item: any) => (
                  <div key={item.ticketId} className="glass-card p-5 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hover:bg-white/[0.01] transition-all">
                    
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{item.title}</h4>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10 shrink-0">
                          {item.otherUser?.avatarUrl ? (
                            <img src={item.otherUser.avatarUrl} alt={item.otherUser.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-600">{item.otherUser?.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-none">
                            Parceiro: <strong className="text-slate-800 dark:text-slate-200 font-bold">{item.otherUser?.name}</strong>
                          </p>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                            {item.otherUser?.userType === 'client' ? 'Cliente' : item.otherUser?.userType === 'company' ? 'Empresa' : 'Técnico'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReviewModal(item)}
                      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/10 shrink-0"
                    >
                      Avaliar Agora <ChevronRight size={12} />
                    </button>

                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>

      {/* Review Modal Backdrop */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            
            {/* Clikable backdrop closes modal */}
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
              className="relative w-full max-w-md bg-[#090b11] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-left"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-500" size={20} />
                  <h3 className="text-lg font-black text-white tracking-tight">Deixar Avaliação</h3>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Ticket Details */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Serviço Concluído</span>
                <h4 className="font-extrabold text-sm text-white leading-tight">{selectedTicket.title}</h4>
                
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center border border-white/10 text-slate-400 text-[10px] font-black">
                    {selectedTicket.otherUser?.avatarUrl ? (
                      <img src={selectedTicket.otherUser.avatarUrl} alt={selectedTicket.otherUser.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedTicket.otherUser?.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-bold leading-none">{selectedTicket.otherUser?.name}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                      {selectedTicket.otherUser?.userType === 'client' ? 'Cliente' : selectedTicket.otherUser?.userType === 'company' ? 'Empresa' : 'Técnico'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReview} className="space-y-6">
                
                {/* Stars selector */}
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left">Sua Nota</label>
                  <div className="flex items-center justify-center gap-2.5 py-3">
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
                          className="text-slate-600 hover:scale-110 active:scale-95 transition-all outline-none"
                        >
                          <Star 
                            size={32} 
                            className={highlighted ? "text-amber-500 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]" : "text-slate-700"} 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Comentário / Feedback (Opcional)</label>
                  <textarea
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    rows={4}
                    placeholder="Descreva brevemente como foi a sua experiência trabalhando com este parceiro..."
                    className="w-full rounded-2xl bg-white/[0.02] border border-white/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white p-3.5 text-xs outline-none transition-all placeholder:text-slate-600 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reviewMutation.isPending}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
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
