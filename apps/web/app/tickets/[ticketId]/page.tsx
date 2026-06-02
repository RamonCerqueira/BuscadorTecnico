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

  const params = useParams();
  const router = useRouter();
  const { userType, token } = useSessionStore();
  const id = params.ticketId as string;

  const ticketQuery = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiGet<any>(`/tickets/${id}`),
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-12 sm:px-6 bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200">
      {/* Banner de Garantias Exclusivas On-Platform */}
      {ticket && (ticket.status === 'open' || ticket.status === 'in_progress') && (
        <div className="mb-8 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-800">🛡️ Garantia de Proteção TechFix</h4>
            <p className="text-xs font-semibold text-amber-700 mt-1 leading-relaxed">
              <strong>Atenção:</strong> O seguro e o sistema de reembolso de peças cobrem <strong>APENAS</strong> serviços finalizados e pagos dentro da plataforma TechFix. Pagamentos por fora violam nossos termos e anulam as garantias.
            </p>
          </div>
        </div>
      )}

      <Link href="/opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8 group">
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Voltar ao Marketplace
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Detalhes do Chamado (Esquerda) */}
        <section className="lg:col-span-2 space-y-8">
          <div className="glass-card bg-white dark:bg-white/5 p-10 border-none dark:border-white/10 shadow-2xl dark:shadow-none">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${ticket.paymentStatus === 'escrow' ? 'bg-blue-50 text-blue-600 outline-blue-100' : 'bg-emerald-50 text-emerald-600 outline-emerald-100'}`}>
                <div className={`h-2 w-2 rounded-full animate-pulse ${ticket.paymentStatus === 'escrow' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                {ticket.paymentStatus === 'escrow' ? 'Pagamento Protegido em Escrow' : 'Aberto para Orçamentos'}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Postado {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {ticket.title}
            </h1>
            
            <div className="mt-8 flex flex-wrap items-center gap-8 border-y border-slate-100 dark:border-white/10 py-6">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Localização</p>
                    <p className="font-bold text-slate-700">{ticket.locationText}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Serviço</p>
                    <p className="font-bold text-slate-700">Elétrica Residencial</p>
                  </div>
               </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4">Descrição do Problema</h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4">
               {/* Placeholders para fotos do chamado */}
               <div className="aspect-video rounded-3xl bg-slate-100 animate-pulse" />
               <div className="aspect-video rounded-3xl bg-slate-100 animate-pulse" />
            </div>
          </div>

          {/* AI Insights Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card bg-gradient-to-br from-indigo-900 to-blue-900 p-10 text-white border-none shadow-2xl relative overflow-hidden"
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
              className="glass-card bg-white dark:bg-white/5 p-10 space-y-6 border-none dark:border-white/10 shadow-2xl dark:shadow-none"
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

                    {ticket.paymentStatus === 'escrow' ? (
                       <div className="space-y-4">
                          <button className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2" disabled>
                             <CheckCircle2 size={16} /> Pagamento Confirmado
                          </button>
                          
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
                              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
                            >
                              <MessageCircle size={18} /> Chat com o Técnico
                            </button>
                          </div>

                          {ticket.status === 'in_progress' && (
                             <button 
                               onClick={() => setIsReviewModalOpen(true)}
                               className="w-full bg-emerald-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                             >
                               Confirmar Conclusão <Zap size={16} />
                             </button>
                          )}
                       </div>
                    ) : (
                      <button 
                        onClick={() => payMutation.mutate(proposal.id)}
                        disabled={payMutation.isPending}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                      >
                        {payMutation.isPending ? 'Redirecionando...' : 'Aceitar e Pagar'} <ArrowRight size={16} />
                      </button>
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
                   <Star size={40} className="fill-current" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Avaliar Serviço</h2>
                <p className="text-slate-500 font-medium">O que você achou do atendimento do técnico?</p>
                
                <div className="flex justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${rating >= s ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Star size={24} className={rating >= s ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>

                <textarea 
                  className="input-field min-h-[120px] resize-none py-4"
                  placeholder="Conte um pouco mais sobre sua experiência..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                    className="btn-primary py-5 text-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {completeMutation.isPending ? 'Finalizando...' : 'Confirmar e Liberar'} <CheckCircle2 size={20} />
                  </button>
                  <button 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Chat Modal estilo WhatsApp */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full max-w-md bg-[#efeae2] dark:bg-[#0b141a] shadow-2xl flex flex-col border-l border-white/10"
            >
              {/* Header do Chat */}
              <div className="flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 border-b border-black/5 dark:border-white/5 shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-300 overflow-hidden shrink-0">
                    {ticket.assignedTo?.avatarUrl ? (
                      <img src={ticket.assignedTo.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg">
                        {ticket.assignedTo?.name?.[0] || 'T'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111b21] dark:text-[#e9edef]">{ticket.assignedTo?.name || 'Técnico Responsável'}</h3>
                    <p className="text-[11px] text-[#667781] dark:text-[#8696a0]">Online</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Área de Mensagens (Estilo WhatsApp) */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 relative"
                style={{
                  backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'repeat',
                  opacity: 0.8
                }}
              >
                {chatQuery.isLoading ? (
                  <div className="flex justify-center p-4"><div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  chatMessages.map((msg: any) => {
                    const isMe = msg.sender.userType === userType; // Simplificação, na prática usaríamos user.sub
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 pt-2 pb-3 shadow-sm relative ${
                          isMe 
                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none' 
                            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'
                        }`}>
                          {!isMe && (
                            <p className="text-[11px] font-bold text-[#027eb5] dark:text-[#53bdeb] mb-0.5">{msg.sender.name}</p>
                          )}
                          
                          {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                            <div className="mb-2 rounded-xl overflow-hidden mt-1">
                              <img src={msg.mediaUrls[0]} alt="Anexo" className="max-h-48 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrls[0], '_blank')} />
                            </div>
                          )}
                          
                          <p className="text-[13.5px] leading-[19px] whitespace-pre-wrap mr-10">{msg.content}</p>
                          
                          <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                            <span className="text-[10px] text-[#667781] dark:text-[#8696a0]/80">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <CheckCircle2 size={12} className="text-[#53bdeb]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 flex items-end gap-2 relative z-10">
                {chatAttachment ? (
                  <div className="absolute -top-16 left-4 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <img src={chatAttachment} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                    <button onClick={() => setChatAttachment('')} className="p-1 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20"><X size={14}/></button>
                  </div>
                ) : null}

                <div className="shrink-0 pb-1.5">
                  <FileUpload
                    variant="icon"
                    onUpload={(urls) => setChatAttachment(urls[0])}
                    maxFiles={1}
                    label=""
                    className="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-full cursor-pointer transition-colors"
                  >
                    <ImageIcon size={22} />
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
                    className="w-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] rounded-2xl px-4 py-3 text-sm focus:outline-none resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={(!chatInput.trim() && !chatAttachment) || sendMessageMutation.isPending}
                    className="shrink-0 h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-sm disabled:opacity-50 transition-colors"
                  >
                    {sendMessageMutation.isPending ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} className="ml-1" />}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
