'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/lib/store';
import { apiGet, apiPost, apiPatch } from '@/lib/api/client';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  ClipboardList, 
  User, 
  DollarSign, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  X,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { queryClient } from '@/lib/query-client';

type Ticket = {
  id: string;
  title: string;
  category: string;
  status: string;
  clientId: string;
  assignedToId: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; avatarUrl: string; userType: string };
  assignedTo?: { id: string; name: string; avatarUrl: string; userType: string } | null;
  proposals?: any[];
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; userType: string; avatarUrl?: string };
};

export default function B2BSupportPage() {
  const router = useRouter();
  const { token, userType } = useSessionStore();

  let userId = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch {}
  }

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'active' | 'history'>('active');
  const [messageText, setMessageText] = useState('');

  // Modals state
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeRating, setCompleteRating] = useState(5);
  const [completeComment, setCompleteComment] = useState('');
  const [completeHoverRating, setCompleteHoverRating] = useState<number | null>(null);

  const [isFinalizeTechModalOpen, setIsFinalizeTechModalOpen] = useState(false);
  const [finalizeAmount, setFinalizeAmount] = useState('0.00');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Tickets
  const ticketsQuery = useQuery({
    queryKey: ['b2b-tickets', userType],
    queryFn: async () => {
      const endpoint = userType === 'client' ? '/tickets' : '/tickets/my-jobs';
      const res = await apiGet<{ data: Ticket[] }>(endpoint);
      return res?.data || [];
    },
    enabled: !!token,
  });

  const tickets = ticketsQuery.data || [];

  // Selected Ticket info
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // 2. Fetch Messages for Selected Ticket (with 3s Polling for live chat)
  const messagesQuery = useQuery({
    queryKey: ['messages', selectedTicketId],
    queryFn: () => apiGet<Message[]>(`/tickets/${selectedTicketId}/messages`),
    enabled: !!selectedTicketId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const messages = messagesQuery.data || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // 3. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiPost(`/tickets/${selectedTicketId}/messages`, { content }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedTicketId] });
    }
  });

  // 4. Complete Ticket Mutation (Client rates provider and resolves ticket)
  const completeTicketMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) => 
      apiPatch(`/tickets/${selectedTicketId}/complete`, { rating, comment }),
    onSuccess: () => {
      setIsCompleteModalOpen(false);
      setCompleteComment('');
      setCompleteRating(5);
      queryClient.invalidateQueries({ queryKey: ['b2b-tickets'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao concluir atendimento');
    }
  });

  // 5. Finalize Tech Mutation (Provider proposes completion value)
  const finalizeTechMutation = useMutation({
    mutationFn: (amount: number) => 
      apiPatch(`/tickets/${selectedTicketId}/finalize-tech`, { amount }),
    onSuccess: () => {
      setIsFinalizeTechModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['b2b-tickets'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao finalizar atendimento');
    }
  });

  // Filter and sort tickets
  const filteredTickets = tickets.filter(t => {
    // Only tickets with a provider assigned can have a chat
    if (!t.assignedToId) return false;

    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.client.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (t.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const isActive = t.status === 'in_progress' || t.status === 'quoted' || t.status === 'open';
    const isHistory = t.status === 'resolved' || t.status === 'closed' || t.status === 'cancelled';

    if (sidebarTab === 'active') return matchesSearch && isActive;
    return matchesSearch && isHistory;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeTicketMutation.mutate({
      rating: completeRating,
      comment: completeComment.trim() || undefined
    });
  };

  const handleFinalizeTechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(finalizeAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }
    finalizeTechMutation.mutate(parsedAmount);
  };

  // Get active proposal value to show inside header summary
  const activeProposal = selectedTicket?.proposals?.find(p => p.providerId === selectedTicket.assignedToId && p.status === 'accepted');
  const finalValue = activeProposal?.estimatedValue ? Number(activeProposal.estimatedValue).toFixed(2) : 'A combinar';

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-500">Faça login para acessar o suporte B2B.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden flex flex-col">
      {/* Background glow lights */}
      <div className="absolute top-[-10%] left-[-10%] h-[400px] w-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[300px] w-[300px] bg-indigo-600/5 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="flex-1 flex w-full max-w-7xl mx-auto border-t border-slate-200 dark:border-white/5 relative z-10 overflow-hidden">
        
        {/* SIDEBAR: Ticket Lists */}
        <div className={`w-full md:w-80 border-r border-slate-200 dark:border-white/5 flex flex-col bg-white/60 dark:bg-black/20 backdrop-blur-xl shrink-0 ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-base uppercase tracking-wider">Suporte B2B</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest">{sidebarTab === 'active' ? 'Ativos' : 'Histórico'}</span>
            </div>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar serviço ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-white/5 text-center text-xs font-black uppercase tracking-wider">
            <button
              onClick={() => setSidebarTab('active')}
              className={`flex-1 py-3 border-b-2 transition-all ${sidebarTab === 'active' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Ativos ({tickets.filter(t => t.assignedToId && (t.status === 'in_progress' || t.status === 'quoted' || t.status === 'open')).length})
            </button>
            <button
              onClick={() => setSidebarTab('history')}
              className={`flex-1 py-3 border-b-2 transition-all ${sidebarTab === 'history' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/[0.02]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Concluídos ({tickets.filter(t => t.assignedToId && (t.status === 'resolved' || t.status === 'closed' || t.status === 'cancelled')).length})
            </button>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {ticketsQuery.isLoading ? (
              <div className="space-y-2 p-2">
                <div className="h-16 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-xl" />
                <div className="h-16 w-full animate-pulse bg-slate-200 dark:bg-white/5 rounded-xl" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <ClipboardList size={28} className="mx-auto opacity-35" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Nenhum chamado listado</p>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const partner = userType === 'client' ? ticket.assignedTo : ticket.client;
                const isSelected = ticket.id === selectedTicketId;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`w-full p-3 rounded-xl flex items-start gap-3 transition-all text-left ${isSelected ? 'bg-blue-600/10 dark:bg-blue-600/10 border border-blue-500/20' : 'bg-transparent border border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.02]'}`}
                  >
                    {/* Partner Avatar */}
                    <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300/40 dark:border-white/10">
                      {partner?.avatarUrl ? (
                        <img src={partner.avatarUrl} alt={partner.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500">{partner?.name?.charAt(0)}</span>
                      )}
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 truncate">{ticket.category || 'Geral'}</span>
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                          ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-slate-500/10 text-slate-400'
                        }`}>{ticket.status}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate leading-tight">{ticket.title}</h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate">{partner?.name}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className={`flex-1 flex flex-col bg-white/40 dark:bg-black/10 backdrop-blur-xl ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          {selectedTicket ? (
            <>
              {/* CHAT HEADER: Summary Card */}
              <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-black/30 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button 
                    onClick={() => setSelectedTicketId(null)}
                    className="md:hidden h-8 w-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest">{selectedTicket.category || 'Geral'}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Atendimento Ativo</span>
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">{selectedTicket.title}</h3>
                    
                    {/* Partner display */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{userType === 'client' ? 'Prestador' : 'Cliente'}:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {userType === 'client' ? selectedTicket.assignedTo?.name : selectedTicket.client.name}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions summary: value & complete actions */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="flex flex-col text-right shrink-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Valor Acordado</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-0.5 justify-end">
                      <DollarSign size={12} /> {finalValue}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />

                  {/* Complete/Finalize Buttons depending on status */}
                  {selectedTicket.status === 'in_progress' && (
                    userType === 'client' ? (
                      <button
                        onClick={() => setIsCompleteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/15 border-none"
                      >
                        <CheckCircle size={12} /> Concluir Atendimento
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsFinalizeTechModalOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/15 border-none"
                      >
                        <CheckCircle size={12} /> Solicitar Conclusão
                      </button>
                    )
                  )}

                  {/* External Ticket view link */}
                  <button
                    onClick={() => router.push(`/tickets/${selectedTicket.id}`)}
                    className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300/40 dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/10 transition-all active:scale-95"
                    title="Ver Chamado Completo"
                  >
                    <ExternalLink size={14} />
                  </button>

                </div>

              </div>

              {/* MESSAGES BODY */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesQuery.isLoading && messages.length === 0 ? (
                  <div className="space-y-4 p-4">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse ml-auto" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <MessageSquare size={36} className="opacity-25" />
                    <p className="text-xs font-bold uppercase tracking-wider">Nenhuma mensagem enviada</p>
                    <p className="text-[10px] text-slate-500 max-w-xs text-center">Comece digitando abaixo para alinhar os detalhes com seu parceiro.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOwnMessage = msg.sender.id === userId;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        {/* Bubble */}
                        <div className={`p-3 rounded-2xl text-xs text-left ${isOwnMessage ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-500/5' : 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-slate-200 rounded-bl-none border border-slate-300/20 dark:border-white/5'}`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {/* Meta info */}
                        <div className="flex items-center gap-1.5 mt-1 text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          {!isOwnMessage && <span>{msg.sender.name} •</span>}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT FOOTER */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-white/5 bg-white/30 dark:bg-black/20 flex gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0 shadow-lg shadow-blue-500/10 border-none"
                >
                  <Send size={14} />
                </button>
              </form>

            </>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/20 dark:bg-black/5">
              <div className="h-16 w-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider">Central de Atendimento B2B</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mt-2 leading-relaxed">
                Selecione um chamado na lista ao lado para acessar o chat, verificar o resumo e acompanhar o andamento do serviço.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Client Concludes Ticket (Star Rating + Review Comment) */}
      <AnimatePresence>
        {isCompleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompleteModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-md bg-[#090b11] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <h3 className="text-lg font-black text-white tracking-tight">Concluir Atendimento</h3>
                </div>
                <button 
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Ao concluir o chamado, o pagamento será liberado para o prestador. Deixe uma avaliação sobre o serviço prestado.
              </p>

              <form onSubmit={handleCompleteSubmit} className="space-y-6">
                
                {/* Star rating selector */}
                <div className="space-y-2 text-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left">Nota do Prestador</label>
                  <div className="flex items-center justify-center gap-2.5 py-3">
                    {[1, 2, 3, 4, 5].map((stars) => {
                      const highlighted = completeHoverRating !== null 
                        ? stars <= completeHoverRating 
                        : stars <= completeRating;
                      return (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setCompleteRating(stars)}
                          onMouseEnter={() => setCompleteHoverRating(stars)}
                          onMouseLeave={() => setCompleteHoverRating(null)}
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
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Comentário ou Feedback (Opcional)</label>
                  <textarea
                    value={completeComment}
                    onChange={(e) => setCompleteComment(e.target.value)}
                    rows={3}
                    placeholder="Como foi o atendimento técnico?"
                    className="w-full rounded-2xl bg-white/[0.02] border border-white/5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white p-3.5 text-xs outline-none transition-all placeholder:text-slate-600 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={completeTicketMutation.isPending}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {completeTicketMutation.isPending ? 'Finalizando...' : 'Concluir & Liberar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Technician Proposes Concluding Value */}
      <AnimatePresence>
        {isFinalizeTechModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFinalizeTechModalOpen(false)}
              className="absolute inset-0"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-sm bg-[#090b11] border border-white/5 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-blue-500" size={20} />
                  <h3 className="text-lg font-black text-white tracking-tight">Finalizar Serviço</h3>
                </div>
                <button 
                  onClick={() => setIsFinalizeTechModalOpen(false)}
                  className="h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Confirme o valor cobrado pelo serviço prestado. Esta ação avisa o cliente para liberar o pagamento e avaliar o serviço.
              </p>

              <form onSubmit={handleCompleteSubmit} className="space-y-4">
                {/* Visual Conclude Action */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Valor Atual</span>
                    <span className="text-sm font-black text-white">R$ {finalValue}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFinalizeTechModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger direct visual tech finalization with active proposal price
                      finalizeTechMutation.mutate(activeProposal?.estimatedValue ? Number(activeProposal.estimatedValue) : 0);
                    }}
                    disabled={finalizeTechMutation.isPending}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {finalizeTechMutation.isPending ? 'Finalizando...' : 'Confirmar & Concluir'}
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
