'use client';

import { useState } from 'react';
import { useSessionStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';
import {
  ArrowLeft, MessageSquare, Plus, CheckCircle2, AlertCircle,
  HelpCircle, ShieldAlert, LifeBuoy, Clock, CornerDownRight, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  adminReply?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useSessionStore();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Senha/Acesso');
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch support tickets
  const ticketsQuery = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => apiGet<SupportTicket[]>('/support'),
    enabled: !!token,
  });

  const tickets = ticketsQuery.data || [];

  // Create Ticket Mutation
  const createMutation = useMutation({
    mutationFn: (newTicket: any) => apiPost<SupportTicket>('/support', newTicket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTitle('');
      setDescription('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao abrir chamado de suporte.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createMutation.mutate({
      title,
      category,
      description
    });
  };

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4 bg-[#07070c]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight text-white">Acesso Restrito</h1>
          <p className="text-zinc-400">Faça login para acessar o suporte.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden pb-32">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[500px] w-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

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
              Suporte & Ajuda
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
              Precisa de auxílio técnico, denunciar uma conduta inadequada ou tirar dúvidas sobre sua conta? Envie uma mensagem direta para os administradores.
            </p>
          </div>
        </header>

        {/* Success Alert */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold"
            >
              <CheckCircle2 size={16} />
              <span>Chamado de suporte enviado com sucesso! Retornaremos o contato em breve.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Support Form */}
          <section className="lg:col-span-5 bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg text-left">
            
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/5 pb-3">
              <LifeBuoy className="text-indigo-500" size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Abrir Solicitação
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Category */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none p-3.5 cursor-pointer"
                >
                  <option value="Senha/Acesso">Senha & Acesso à Conta</option>
                  <option value="Denunciar Usuário">Denunciar Usuário</option>
                  <option value="Erro no Sistema">Erro ou Problema Técnico</option>
                  <option value="Dúvidas">Dúvidas sobre o App</option>
                  <option value="Outros">Outros Assuntos</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assunto / Título</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="EX: Não consigo alterar meus dados pessoais"
                  required
                  className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Descrição Detalhada</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique detalhadamente o ocorrido (inclua nomes, erros observados ou dados de acesso se necessário)..."
                  required
                  rows={5}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-605 hover:from-indigo-400 hover:to-purple-550 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20 border-none mt-2 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Enviando...' : 'Enviar Chamado de Suporte'}
              </button>

            </form>
          </section>

          {/* Tickets History List */}
          <section className="lg:col-span-7 space-y-4 text-left">
            
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <MessageSquare className="text-zinc-400" size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Histórico de Chamados
              </h3>
            </div>

            <div className="grid gap-4">
              {ticketsQuery.isLoading ? (
                <div className="space-y-4">
                  <div className="h-28 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                  <div className="h-28 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="bg-white dark:bg-[#0c0c0e]/80 border-2 border-dashed border-slate-200 dark:border-zinc-850 p-12 text-center rounded-3xl">
                  <LifeBuoy size={32} className="mx-auto text-zinc-550 mb-3" />
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Sem chamados ativos</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1">Qualquer chamado aberto por você com nossa equipe de suporte será exibido aqui.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-md hover:border-indigo-500/10 transition-colors"
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wide bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800">
                          {ticket.category}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          ticket.status === 'resolved' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-amber-500/10 text-amber-500 animate-pulse'
                        }`}>
                          {ticket.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                        </span>
                      </div>

                      <span className="text-[9px] font-bold text-zinc-550 flex items-center gap-1">
                        <Clock size={10} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1 text-left">
                      <h4 className="font-black text-sm text-slate-905 dark:text-white leading-tight">{ticket.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-semibold leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Admin Reply */}
                    {ticket.adminReply && (
                      <div className="mt-3 p-3.5 bg-slate-50 dark:bg-zinc-950/60 border border-slate-150 dark:border-zinc-850 rounded-2xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-500 tracking-wider">
                          <ShieldCheck size={12} className="shrink-0" /> Resposta da Equipe
                        </div>
                        <p className="text-xs text-slate-700 dark:text-zinc-300 font-bold italic leading-relaxed pl-1.5">
                          "{ticket.adminReply}"
                        </p>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </section>
        </div>

      </div>
    </main>
  );
}
