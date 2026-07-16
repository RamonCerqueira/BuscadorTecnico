'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPatch } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  DollarSign, 
  Calendar,
  Zap,
  CheckCircle2,
  Star,
  ArrowRight,
  Plus,
  X,
  Eye,
  FileText,
  MessageCircle,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function TicketDetailPage() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  // Proposal State
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalDate, setProposalDate] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  
  // Finalize State
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [finalizeAmount, setFinalizeAmount] = useState('');

  // Bargain/Negotiation States
  const [discountInputProposalId, setDiscountInputProposalId] = useState<string | null>(null);
  const [discountInputAmount, setDiscountInputAmount] = useState('');
  
  // Material Refund States
  const [refundDesc, setRefundDesc] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReceipt, setRefundReceipt] = useState('');
  const [showRefundForm, setShowRefundForm] = useState(false);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gallery lightbox state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { userType, token } = useSessionStore();
  const id = params.ticketId as string;

  const ticketQuery = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiGet<any>(`/tickets/${id}`),
  });

  const improveMessageMutation = useMutation({
    mutationFn: (data: { notes: string; ticketDescription: string }) => apiPost<{ text: string }>('/ai/generate-proposal', data),
    onSuccess: (data) => {
      setProposalMessage(data.text);
    }
  });

  const createProposalMutation = useMutation({
    mutationFn: (data: any) => apiPost(`/tickets/${id}/proposals`, data),
    onSuccess: () => {
      ticketQuery.refetch();
      setProposalAmount('');
      setProposalDate('');
      setProposalMessage('');
      alert('Proposta enviada com sucesso!');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao enviar proposta. Tente novamente.');
    }
  });

  const [updateAmountInput, setUpdateAmountInput] = useState('');
  const updateAmountMutation = useMutation({
    mutationFn: (data: { proposalId: string, amount: number }) => apiPatch(`/tickets/${id}/proposals/${data.proposalId}/update-amount`, { amount: data.amount }),
    onSuccess: () => {
      ticketQuery.refetch();
      setUpdateAmountInput('');
      alert('Valor da proposta atualizado!');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao atualizar o valor.');
    }
  });

  const payMutation = useMutation({
    mutationFn: (proposalId: string) => apiPost<{ url: string }>('/payments/checkout/job', { ticketId: id, proposalId }),
    onSuccess: (data) => {
      window.location.href = data.url;
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => apiPatch<any>(`/tickets/${id}/complete`, { rating, comment }),
    onSuccess: () => {
      ticketQuery.refetch();
      setIsReviewModalOpen(false);
    }
  });

  const finalizeTechMutation = useMutation({
    mutationFn: (amount: number) => apiPatch<any>(`/tickets/${id}/finalize-tech`, { amount }),
    onSuccess: () => {
      ticketQuery.refetch();
      setIsFinalizeModalOpen(false);
      alert('Atendimento finalizado com sucesso!');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao finalizar atendimento. Tente novamente.');
    }
  });

  const rejectProposalMutation = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/reject`, {}),
    onSuccess: () => {
      ticketQuery.refetch();
      alert('Proposta recusada com sucesso.');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao recusar proposta.');
    }
  });

  const counterOfferMutation = useMutation({
    mutationFn: (data: { proposalId: string, amount: number }) => apiPost(`/proposals/${data.proposalId}/counter-offer`, { amount: data.amount }),
    onSuccess: () => {
      ticketQuery.refetch();
      setDiscountInputProposalId(null);
      setDiscountInputAmount('');
      alert('Contraproposta de desconto enviada com sucesso!');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao solicitar desconto.');
    }
  });

  const acceptCounterOfferMutation = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/accept-counter-offer`, {}),
    onSuccess: () => {
      ticketQuery.refetch();
      alert('Contraproposta aceita! O chamado foi iniciado.');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao aceitar contraproposta.');
    }
  });

  const rejectCounterOfferMutation = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/reject-counter-offer`, {}),
    onSuccess: () => {
      ticketQuery.refetch();
      alert('Contraproposta recusada.');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao recusar contraproposta.');
    }
  });

  const refundsQuery = useQuery({
    queryKey: ['refunds', id],
    queryFn: () => apiGet<any[]>(`/tickets/${id}/refunds`),
    enabled: !!ticketQuery.data
  });

  const createRefundMutation = useMutation({
    mutationFn: (data: any) => apiPost(`/tickets/${id}/refunds`, data),
    onSuccess: () => {
      refundsQuery.refetch();
      setRefundDesc('');
      setRefundAmount('');
      setRefundReceipt('');
      setShowRefundForm(false);
      alert('Solicitação de reembolso de material enviada com sucesso!');
    }
  });

  const approveRefundMutation = useMutation({
    mutationFn: (refundId: string) => apiPatch(`/refunds/${refundId}/approve`, {}),
    onSuccess: () => {
      refundsQuery.refetch();
    }
  });

  const rejectRefundMutation = useMutation({
    mutationFn: (refundId: string) => apiPatch(`/refunds/${refundId}/reject`, {}),
    onSuccess: () => {
      refundsQuery.refetch();
    }
  });

  const signProposalMutation = useMutation({
    mutationFn: (data: { proposalId: string; signatureHash: string }) => {
      return apiPost(`/proposals/${data.proposalId}/sign`, { signatureHash: data.signatureHash });
    },
    onSuccess: () => {
      ticketQuery.refetch();
      alert('Contrato e Proposta assinados digitalmente com sucesso!');
    }
  });

  const [clientSignatureName, setClientSignatureName] = useState('');

  const ticket = ticketQuery.data;

  let userId = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch {}
  }

  const myProposal = ticket?.proposals?.find((p: any) => p.provider?.id === userId);

  const priceSuggestionQuery = useQuery({
    queryKey: ['price-suggestion', ticket?.category, ticket?.description, ticket?.locationText],
    queryFn: () => {
      if (!ticket) return null;
      const category = ticket.category || 'Geral';
      const city = ticket.locationText || 'Brasil';
      const description = ticket.description;
      return apiGet<any>(`/ai/suggest-price?category=${encodeURIComponent(category)}&description=${encodeURIComponent(description)}&city=${encodeURIComponent(city)}`);
    },
    enabled: !!ticket && (userType === 'technician' || userType === 'company')
  });

  const chatQuery = useQuery({
    queryKey: ['chat', id],
    queryFn: () => apiGet<any[]>(`/tickets/${id}/messages`),
    enabled: isChatOpen
  });

  useEffect(() => {
    if (chatQuery.data) {
      setChatMessages(chatQuery.data);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatQuery.data]);

  useEffect(() => {
    if (isChatOpen) {
      const rawSession = window.localStorage.getItem('buscador-session');
      let token = '';
      if (rawSession) {
        try {
          const parsed = JSON.parse(rawSession);
          token = parsed.state?.token || '';
        } catch (e) {}
      }

      if (token) {
        const socket = initSocket(token);
        socket.emit('joinTicket', id);

        const handleNewMessage = (msg: any) => {
          setChatMessages((prev) => [...prev, msg]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
          socket.off('newMessage', handleNewMessage);
          socket.emit('leaveTicket', id);
          disconnectSocket();
        };
      }
    }
  }, [isChatOpen, id]);

  const sendMessageMutation = useMutation({
    mutationFn: () => apiPost(`/tickets/${id}/messages`, { content: chatInput, mediaUrls: chatAttachment ? [chatAttachment] : [] }),
    onSuccess: () => {
      setChatInput('');
      setChatAttachment('');
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;
    sendMessageMutation.mutate();
  };

  if (ticketQuery.isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!ticket) return <div className="p-20 text-center">Chamado não encontrado.</div>;

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'open':
        return (
          <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Aberto para Orçamentos
          </span>
        );
      case 'quoted':
        return (
          <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-blue-100 dark:border-blue-500/20">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Recebendo Orçamentos
          </span>
        );
      case 'in_progress':
        return (
          <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Atendimento em Andamento
          </span>
        );
      case 'resolved':
      case 'closed':
        return (
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-500/30">
            <div className="h-2 w-2 rounded-full bg-emerald-600" />
            Atendimento Finalizado
          </span>
        );
      case 'disputed':
        return (
          <span className="rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border border-rose-100 dark:border-rose-500/20">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            Em Disputa
          </span>
        );
      case 'cancelled':
        return (
          <span className="rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12 sm:px-6 bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200">
      {/* Banner de Garantias Exclusivas On-Platform */}
      {ticket && (ticket.status === 'open' || ticket.status === 'in_progress') && (
        <div className="mb-8 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-950 dark:text-amber-300">🛡️ Garantia de Proteção TechFix</h4>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400/90 mt-1 leading-relaxed">
              <strong>Atenção:</strong> O seguro e o sistema de reembolso de peças cobrem <strong>APENAS</strong> serviços finalizados e pagos dentro da plataforma TechFix. Pagamentos por fora violam nossos termos e anulam as garantias.
            </p>
          </div>
        </div>
      )}

      <Link href="/opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors mb-8 group">
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Voltar ao Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Detalhes do Chamado (Esquerda) */}
        <section className="lg:col-span-2 space-y-8">
          <div className="glass-card bg-white dark:bg-white/5 p-8 md:p-12 border-none dark:border-white/10 shadow-2xl dark:shadow-none">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {getStatusBadge()}
              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                Postado {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {ticket.title}
            </h1>
            
            <div className="mt-8 flex flex-wrap items-center gap-8 border-y border-slate-100 dark:border-white/10 py-6">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Localização</p>
                    <p className="font-bold text-slate-700 dark:text-zinc-200">{ticket.locationText}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Tipo de Serviço</p>
                    <p className="font-bold text-slate-700 dark:text-zinc-200">Elétrica Residencial</p>
                  </div>
               </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Descrição do Problema</h3>
              <p className="text-lg text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
            
            {/* Galeria de Fotos Anexadas */}
            {ticket.mediaUrls && ticket.mediaUrls.length > 0 ? (
              <div className="mt-12">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4">Fotos Anexadas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ticket.mediaUrls.map((url: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedImage(url)}
                      className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-zinc-900 group shadow-sm"
                    >
                      <img src={url} alt={`Foto do chamado ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye size={20} className="text-white drop-shadow" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-12 p-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/10">
                <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500">Nenhuma foto anexada a este chamado.</p>
              </div>
            )}
          </div>

          {/* AI Insights Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-gradient-to-br from-indigo-900 to-blue-900 p-8 md:p-12 text-white border-none shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Sparkles size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-xl">
                 <Sparkles size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">TechFix AI Insights</h2>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/10">
                 <p className="text-sm font-medium leading-relaxed italic text-blue-100">
                   "{ticket.aiInsights || 'Analizando detalhadamente as fotos e a descrição do chamado para gerar recomendações técnicas...'}"
                 </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                 <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-400" /> Complexidade: Baixa/Média
                 </div>
                 <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-400" /> Tempo Estimado: 2h - 4h
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Seção de Reembolso de Materiais e Peças */}
          {ticket && (ticket.status !== 'open' && ticket.status !== 'quoted') && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-white dark:bg-white/5 p-8 md:p-12 space-y-6 border-none dark:border-white/10 shadow-2xl dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-600">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reembolso de Materiais & Peças</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Gerenciamento de despesas adicionais com peças e insumos</p>
                  </div>
                </div>

                {(userType === 'technician' || userType === 'company') && ticket.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => setShowRefundForm(!showRefundForm)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-600 px-4 py-2.5 rounded-xl transition-all"
                  >
                    <Plus size={14} /> {showRefundForm ? 'Cancelar' : 'Solicitar Reembolso'}
                  </button>
                )}
              </div>

              {/* Solicitar Form */}
              <AnimatePresence>
                {showRefundForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border border-slate-100 bg-slate-50/50 rounded-2xl p-5 space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição das Peças/Materiais</label>
                      <input
                        className="input-field bg-white"
                        placeholder="Ex: Disjuntor NEMA 50A + Fita Isolante 3M"
                        value={refundDesc}
                        onChange={(e) => setRefundDesc(e.target.value)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Valor Gasto (R$)</label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            className="input-field bg-white pl-9"
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cupom Fiscal (Comprovante)</label>
                        {refundReceipt ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-white">
                            <img src={refundReceipt} alt="Comprovante" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setRefundReceipt('')}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <FileUpload
                            onUpload={(urls) => setRefundReceipt(urls[0])}
                            maxFiles={1}
                            label="Subir Foto do Cupom"
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!refundDesc || !refundAmount || !refundReceipt || createRefundMutation.isPending}
                      onClick={() => createRefundMutation.mutate({
                        description: refundDesc,
                        amount: Number(refundAmount),
                        receiptUrl: refundReceipt
                      })}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/10"
                    >
                      {createRefundMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista de Reembolsos */}
              <div className="space-y-4 mt-4">
                {refundsQuery.data?.map((refund) => (
                  <div key={refund.id} className="border border-slate-100 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 dark:hover:border-white/20 transition-colors">
                    <div className="flex items-start gap-4">
                      {refund.receiptUrl && (
                        <a href={refund.receiptUrl} target="_blank" rel="noopener noreferrer" className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-100 block shrink-0 group">
                          <img src={refund.receiptUrl} alt="Cupom" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </a>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{refund.description}</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          <span className="text-cyan-600">R$ {Number(refund.amount).toFixed(2)}</span>
                          <span>•</span>
                          <span>{new Date(refund.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                      {refund.status === 'pending' ? (
                        userType === 'client' ? (
                          <>
                            <button
                              onClick={() => approveRefundMutation.mutate(refund.id)}
                              disabled={approveRefundMutation.isPending}
                              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => rejectRefundMutation.mutate(refund.id)}
                              disabled={rejectRefundMutation.isPending}
                              className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              Recusar
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                            <Clock size={12} /> Pendente
                          </span>
                        )
                      ) : refund.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <CheckCircle2 size={12} /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">
                          <X size={12} /> Recusado
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {(!refundsQuery.data || refundsQuery.data.length === 0) && (
                  <div className="py-8 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                    <FileText size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-400">Nenhum reembolso de material solicitado.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </section>

        {/* Orçamento e Ações (Direita) */}
        <aside className="space-y-6">
          {userType === 'technician' || userType === 'company' ? (
            myProposal ? (
              <div className="glass-card bg-white dark:bg-white/5 p-8 sticky top-24 shadow-2xl dark:shadow-none border-blue-100/50 dark:border-white/10">
                <h2 className="text-xl font-bold mb-6">Sua Proposta Oficial</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/10">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Status Atual</span>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        myProposal.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' :
                        myProposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                        'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                    }`}>
                      {myProposal.status === 'pending' ? 'Aguardando Cliente' :
                       myProposal.status === 'accepted' ? 'Proposta Aceita!' : 'Proposta Recusada'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor Ofertado</span>
                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">R$ {Number(myProposal.estimatedValue).toFixed(2)}</div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sua Mensagem</span>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 leading-relaxed">
                      "{myProposal.message}"
                    </p>
                  </div>

                  {myProposal.status === 'pending' && myProposal.counterOfferStatus === 'pending' && (
                    <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 p-5 border border-amber-200 dark:border-amber-800/30 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        <Sparkles size={14} className="animate-pulse" /> Desconto Solicitado!
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        O cliente solicitou pagar <span className="text-amber-600 dark:text-amber-400 font-extrabold text-lg">R$ {Number(myProposal.counterOfferValue).toFixed(2)}</span> por este serviço.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptCounterOfferMutation.mutate(myProposal.id)}
                          disabled={acceptCounterOfferMutation.isPending || rejectCounterOfferMutation.isPending}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 border-none"
                        >
                          {acceptCounterOfferMutation.isPending ? 'Aceitando...' : 'Aceitar'}
                        </button>
                        <button
                          onClick={() => rejectCounterOfferMutation.mutate(myProposal.id)}
                          disabled={acceptCounterOfferMutation.isPending || rejectCounterOfferMutation.isPending}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 border-none"
                        >
                          {rejectCounterOfferMutation.isPending ? 'Recusando...' : 'Recusar'}
                        </button>
                      </div>
                    </div>
                  )}

                  {myProposal.status === 'pending' && (
                    <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3 mt-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atualizar Valor (Negociação)</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            className="input-field !pl-10 h-12 text-sm font-bold w-full"
                            placeholder="Novo valor"
                            value={updateAmountInput}
                            onChange={(e) => setUpdateAmountInput(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={() => updateAmountMutation.mutate({ proposalId: myProposal.id, amount: Number(updateAmountInput) })}
                          disabled={updateAmountMutation.isPending || !updateAmountInput}
                          className="btn-primary px-6 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20"
                        >
                          {updateAmountMutation.isPending ? '...' : 'Atualizar'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium text-center">
                        O cliente será notificado caso você altere o valor do orçamento.
                      </p>
                    </div>
                  )}

                  {myProposal.status === 'accepted' && ticket.status === 'in_progress' && (
                    <div className="pt-6 border-t border-slate-100 dark:border-white/10 space-y-3 mt-4">
                      <button
                        onClick={() => setIsChatOpen(true)}
                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 border-none"
                      >
                        <MessageCircle size={18} /> Chat com o Cliente
                      </button>

                      <button
                        onClick={() => {
                          setFinalizeAmount(myProposal.estimatedValue ? String(myProposal.estimatedValue) : '');
                          setIsFinalizeModalOpen(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border-none"
                      >
                        Finalizar Atendimento <CheckCircle2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-card bg-white dark:bg-white/5 p-8 sticky top-24 shadow-2xl dark:shadow-none border-blue-100/50 dark:border-white/10">
                <h2 className="text-xl font-bold mb-6">Enviar Orçamento</h2>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Valor Estimado (R$)</label>
                       <div className="relative">
                         <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                           className="input-field !pl-12 h-14 text-xl font-bold" 
                           placeholder="0,00" 
                           value={proposalAmount}
                           onChange={(e) => setProposalAmount(e.target.value)}
                         />
                       </div>
                    </div>

                    {/* Widget de Precificação Inteligente por IA */}
                    {priceSuggestionQuery.data && (
                      <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-800/30 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
                          <Sparkles size={14} className="animate-pulse" /> Sugestão Inteligente IA
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Faixa sugerida: <span className="text-blue-600 dark:text-blue-400">R$ {priceSuggestionQuery.data.minPrice} - R$ {priceSuggestionQuery.data.maxPrice}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                          {priceSuggestionQuery.data.reason}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Previsão de Visita</label>
                       <div className="relative">
                         <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                           className="input-field !pl-12 h-14" 
                           type="date" 
                           value={proposalDate}
                           onChange={(e) => setProposalDate(e.target.value)}
                         />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mensagem para o Cliente</label>
                       <textarea 
                         className="input-field min-h-[120px] resize-none py-4" 
                         placeholder="Explique seu diferencial e como pretende resolver o problema..." 
                         value={proposalMessage}
                         onChange={(e) => setProposalMessage(e.target.value)}
                       />
                       <button
                         onClick={() => {
                           if (!proposalMessage) return;
                           improveMessageMutation.mutate({ notes: proposalMessage, ticketDescription: ticket.description });
                         }}
                         disabled={!proposalMessage || improveMessageMutation.isPending}
                         className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                       >
                         {improveMessageMutation.isPending ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                         {improveMessageMutation.isPending ? 'Redigindo...' : '✨ Melhorar Texto com IA'}
                       </button>
                    </div>

                    <button 
                      onClick={() => createProposalMutation.mutate({
                        estimatedValue: Number(proposalAmount),
                        message: proposalMessage,
                        // scheduledAt: proposalDate // API might need to support this
                      })}
                      disabled={createProposalMutation.isPending}
                      className="btn-primary w-full py-5 text-lg shadow-blue-500/20"
                    >
                      {createProposalMutation.isPending ? 'Enviando...' : 'Enviar Proposta Oficial'}
                    </button>

                   <div className="flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-500 outline outline-1 outline-amber-100 dark:outline-amber-500/20">
                      <ShieldCheck size={20} className="shrink-0" />
                      <p className="font-medium leading-relaxed">
                        Sua proposta é protegida pela **Garantia TechFix**. O pagamento só é liberado após a conclusão do serviço.
                      </p>
                   </div>
                </div>
              </div>
            )
          ) : (
            <div className="glass-card bg-white dark:bg-white/5 p-8 sticky top-24 shadow-2xl dark:shadow-none border-blue-100/50 dark:border-white/10">
              <h2 className="text-xl font-bold mb-6">Propostas Recebidas</h2>
              
              <div className="space-y-4">
                {ticket.proposals?.length === 0 && (
                   <div className="py-12 text-center space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600">
                         <Clock size={24} />
                      </div>
                      <p className="text-sm font-medium text-slate-400">Aguardando orçamentos...</p>
                   </div>
                )}
                
                {ticket.proposals?.map((proposal: any) => (
                  <div key={proposal.id} className="rounded-2xl border border-slate-100 dark:border-white/10 p-5 space-y-4 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors bg-white/50 dark:bg-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{proposal.provider.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                            <Star size={10} className="fill-current" /> 4.9 (124)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-blue-600">R$ {Number(proposal.estimatedValue).toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Total</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      {proposal.message}
                    </p>

                    {(ticket.paymentStatus === 'escrow' || ticket.status === 'in_progress') ? (
                       <div className="space-y-4">
                          {(ticket.paymentStatus === 'escrow' || ticket.status === 'in_progress') && (
                            <button className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2" disabled>
                               <CheckCircle2 size={16} /> {ticket.status === 'in_progress' ? 'Atendimento Iniciado' : 'Pagamento Confirmado'}
                            </button>
                          )}
                          
                          {/* 4.5 — Assinatura Digital do Contrato / Proposta */}
                          {proposal.status === 'accepted' && (
                            <div className="mt-4 border-t border-slate-100 pt-4 space-y-3 text-left">
                              {proposal.signedAt ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase bg-emerald-50 p-3 rounded-xl border border-emerald-100 justify-center">
                                    <ShieldCheck size={16} /> Assinado Digitalmente
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-wider text-center">
                                    Assinatura ID: {proposal.signatureHash}
                                  </p>
                                  <button
                                    onClick={() => {
                                      const text = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TECHFIX\n\nChamado: ${ticket.title}\nPrestador: ${proposal.provider.name}\nCliente: ${ticket.client.name}\nValor: R$ ${Number(proposal.estimatedValue).toFixed(2)}\n\nAssinado eletronicamente por ${ticket.client.name} em ${new Date(proposal.signedAt).toLocaleString('pt-BR')}\nAssinatura de Segurança SHA-256 Hash:\n${proposal.signatureHash}\n\nEste documento tem validade jurídica e comprova o acordo on-platform.`;
                                      const blob = new Blob([text], { type: 'text/plain' });
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `contrato_assinado_${proposal.id}.txt`;
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    }}
                                    className="w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <FileText size={14} /> Baixar Proposta Assinada (.txt)
                                  </button>
                                </div>
                              ) : (
                                userType === 'client' ? (
                                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-700">✍️ Assinatura Eletrônica do Contrato</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Assine o termo de prestação para oficializar o serviço.</p>
                                    <input
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                                      placeholder="Digite seu nome completo como assinatura"
                                      value={clientSignatureName}
                                      onChange={(e) => setClientSignatureName(e.target.value)}
                                    />
                                    <button
                                      onClick={() => {
                                        if (!clientSignatureName) return alert('Por favor, digite seu nome.');
                                        const hash = 'TF-' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();
                                        signProposalMutation.mutate({ proposalId: proposal.id, signatureHash: hash });
                                      }}
                                      disabled={!clientSignatureName || signProposalMutation.isPending}
                                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                      {signProposalMutation.isPending ? 'Assinando...' : 'Assinar Digitalmente'}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-black text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-1.5 uppercase tracking-wide justify-center">
                                    <Clock size={14} className="animate-spin shrink-0" /> Aguardando assinatura do cliente
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          
                          {/* Botão de Chat (Apenas após aceite) */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                            <button
                              onClick={() => setIsChatOpen(true)}
                              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 border-none"
                            >
                              <MessageCircle size={18} /> Chat com o Técnico
                            </button>
                          </div>

                          {ticket.status === 'in_progress' && (
                             <button 
                               onClick={() => setIsReviewModalOpen(true)}
                               className="w-full bg-emerald-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border-none"
                             >
                               Confirmar Conclusão <Zap size={16} />
                             </button>
                          )}
                       </div>
                    ) : (
                      <div className="space-y-3">
                        {proposal.status === 'rejected' ? (
                          <div className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 p-3.5 rounded-xl border border-rose-100 dark:border-rose-500/20 text-center uppercase tracking-widest animate-none">
                            Proposta Recusada
                          </div>
                        ) : proposal.counterOfferStatus === 'pending' ? (
                          <div className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-100 dark:border-amber-500/20 text-center uppercase tracking-widest animate-pulse">
                            Contraproposta de R$ {Number(proposal.counterOfferValue).toFixed(2)} enviada. Aguardando retorno.
                          </div>
                        ) : (
                          <>
                            {proposal.counterOfferStatus === 'rejected' && (
                              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/5 p-3.5 rounded-xl border border-rose-500/10 mb-3">
                                ⚠️ Sua proposta de desconto de R$ {Number(proposal.counterOfferValue).toFixed(2)} foi recusada pelo técnico.
                              </div>
                            )}

                            <button 
                              onClick={() => payMutation.mutate(proposal.id)}
                              disabled={payMutation.isPending}
                              className="w-full bg-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 border-none"
                            >
                              {payMutation.isPending ? 'Redirecionando...' : 'Aceitar e Pagar'} <ArrowRight size={16} />
                            </button>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDiscountInputProposalId(proposal.id);
                                  setDiscountInputAmount('');
                                }}
                                disabled={discountInputProposalId === proposal.id}
                                className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border-none"
                              >
                                Solicitar Desconto
                              </button>

                              <button
                                onClick={() => rejectProposalMutation.mutate(proposal.id)}
                                disabled={rejectProposalMutation.isPending}
                                className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border-none"
                              >
                                {rejectProposalMutation.isPending ? '...' : 'Recusar'}
                              </button>
                            </div>

                            {discountInputProposalId === proposal.id && (
                              <div className="mt-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quanto você deseja pagar?</label>
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                      className="input-field !pl-9 h-11 text-xs font-bold w-full bg-white text-slate-900 dark:text-white"
                                      placeholder="Digite o valor"
                                      value={discountInputAmount}
                                      onChange={(e) => setDiscountInputAmount(e.target.value)}
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (!discountInputAmount || isNaN(Number(discountInputAmount))) {
                                        return alert('Insira um valor válido.');
                                      }
                                      counterOfferMutation.mutate({ proposalId: proposal.id, amount: Number(discountInputAmount) });
                                    }}
                                    disabled={counterOfferMutation.isPending || !discountInputAmount}
                                    className="btn-primary px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none"
                                  >
                                    {counterOfferMutation.isPending ? '...' : 'Enviar'}
                                  </button>
                                  <button
                                    onClick={() => setDiscountInputProposalId(null)}
                                    className="p-3 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors border-none"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-3 text-[10px] text-slate-400">
                 <ShieldCheck size={16} className="text-blue-500" />
                 <p className="font-medium">O valor fica seguro em Escrow até você confirmar a conclusão.</p>
              </div>
            </div>
          )}

          {/* Laudo Técnico por IA Widget */}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <div className="glass-card bg-white dark:bg-white/5 p-8 shadow-2xl dark:shadow-none border-blue-100/50 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Laudo Técnico Gerado</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Processado via Gemini AI</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    const res = await apiPost<any>(`/tickets/${id}/tech-report`, {});
                    const blob = new Blob([res.reportMarkdown], { type: 'text/markdown' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `laudo_tecnico_techfix_${id}.md`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    alert('Erro ao gerar laudo.');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> Download Laudo (.md)
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-800 shadow-2xl z-10"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                   <Star size={32} className="fill-current" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Avaliar Serviço</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">O que você achou do atendimento do profissional?</p>
                </div>
                
                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                        rating >= s 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105' 
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Star size={20} className={rating >= s ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>

                <textarea 
                  className="input-field min-h-[120px] resize-none py-4"
                  placeholder="Conte um pouco mais sobre sua experiência..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                    className="btn-primary py-4 text-sm font-bold shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {completeMutation.isPending ? 'Finalizando...' : 'Confirmar e Liberar'} <CheckCircle2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 py-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Finalize Atendimento Modal for Technician/Company */}
      <AnimatePresence>
        {isFinalizeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFinalizeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-100 dark:border-zinc-800 shadow-2xl z-10"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                   <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Finalizar Atendimento</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                    Confirme o valor final recebido por este atendimento. Este valor será contabilizado em seu faturamento no painel financeiro.
                  </p>
                </div>
                
                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Valor Recebido (R$)</label>
                   <div className="relative">
                     <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       className="input-field !pl-12 h-13 text-lg font-bold" 
                       placeholder="0,00" 
                       value={finalizeAmount}
                       onChange={(e) => setFinalizeAmount(e.target.value)}
                     />
                   </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => {
                      if (!finalizeAmount || isNaN(Number(finalizeAmount))) {
                        return alert('Por favor, insira um valor válido.');
                      }
                      finalizeTechMutation.mutate(Number(finalizeAmount));
                    }}
                    disabled={finalizeTechMutation.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border-none"
                  >
                    {finalizeTechMutation.isPending ? 'Finalizando...' : 'Confirmar e Finalizar'} <CheckCircle2 size={16} />
                  </button>
                  <button 
                    onClick={() => setIsFinalizeModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 py-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Chat Modal estilo Premium */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full max-w-md bg-slate-50 dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-900"
            >
              {/* Header do Chat */}
              <div className="flex items-center justify-between bg-white dark:bg-zinc-900 px-6 py-4 border-b border-slate-100 dark:border-zinc-800 relative z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                    {ticket.assignedTo?.avatarUrl ? (
                      <img src={ticket.assignedTo.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-extrabold text-sm">
                        {ticket.assignedTo?.name?.[0] || 'T'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-100">{ticket.assignedTo?.name || 'Profissional Parceiro'}</h3>
                    <p className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo agora
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-zinc-950">
                {chatQuery.isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  chatMessages.map((msg: any) => {
                    const isMe = msg.sender.userType === userType;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm relative ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-100 dark:border-zinc-800/80 rounded-tl-none'
                        }`}>
                          {!isMe && (
                            <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 mb-0.5">{msg.sender.name}</p>
                          )}
                          
                          {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                            <div className="mb-2 rounded-xl overflow-hidden mt-1 max-w-full">
                              <img 
                                src={msg.mediaUrls[0]} 
                                alt="Anexo" 
                                className="max-h-48 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setSelectedImage(msg.mediaUrls[0])} 
                              />
                            </div>
                          )}
                          
                          <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className={`text-[8px] font-bold ${isMe ? 'text-blue-200/90' : 'text-slate-400 dark:text-zinc-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCircle2 size={10} className="text-blue-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white dark:bg-zinc-900 px-6 py-4 flex items-end gap-3 border-t border-slate-100 dark:border-zinc-800 relative z-10">
                {chatAttachment ? (
                  <div className="absolute -top-16 left-6 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <img src={chatAttachment} alt="Preview" className="h-10 w-10 object-cover rounded-xl" />
                    <button onClick={() => setChatAttachment('')} className="p-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 border-none"><X size={12}/></button>
                  </div>
                ) : null}

                <div className="shrink-0 pb-1">
                  <FileUpload
                    variant="icon"
                    onUpload={(urls) => setChatAttachment(urls[0])}
                    maxFiles={1}
                    label=""
                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <ImageIcon size={20} />
                  </FileUpload>
                </div>
                
                <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Digite uma mensagem"
                    className="w-full bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 border border-slate-100 dark:border-zinc-900 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[42px] max-h-[120px] transition-all"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && !chatAttachment) || sendMessageMutation.isPending}
                    className="shrink-0 h-11 w-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-colors border-none"
                  >
                    {sendMessageMutation.isPending ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} className="ml-0.5" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative max-w-5xl max-h-[85vh] z-10 overflow-hidden rounded-2xl shadow-2xl"
            >
              <img src={selectedImage} alt="Ampliada" className="max-w-full max-h-[85vh] object-contain rounded-2xl animate-none" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors border-none"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
