'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';
import Link from 'next/link';
import { 
  ClipboardList, 
  ArrowLeft, 
  Clock, 
  ArrowUpRight,
  MessageSquare,
  PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  assignedToId?: string;
  paymentStatus: string;
};

export default function TicketsPage() {
  const { userType, token } = useSessionStore();

  const ticketsQuery = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => apiGet<{ data: Ticket[] }>(userType === 'client' ? '/tickets' : '/tickets/my-jobs'),
    enabled: !!token
  });

  const tickets = ticketsQuery.data?.data || [];

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4 group">
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" /> Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight">
              {userType === 'client' ? 'Gerenciador de ' : 'Meus '}
              <span className="premium-gradient-text">{userType === 'client' ? 'Chamados' : 'Serviços'}</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Acompanhe e gerencie todos os seus serviços em um só lugar.</p>
          </div>
          
          {userType === 'client' && (
            <Link href="/tickets/new" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
              <PlusCircle size={18} /> Novo Chamado
            </Link>
          )}
        </div>

        {/* Loading State */}
        {ticketsQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="glass-card p-16 text-center border border-dashed border-slate-200/80 dark:border-white/10 relative overflow-hidden bg-slate-100/20 dark:bg-white/[0.01]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
                    <ClipboardList size={28} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Nenhum registro encontrado</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                    {userType === 'client' 
                      ? 'Você não possui nenhum chamado aberto ou em andamento. Quando precisar de um serviço técnico, solicite por aqui!' 
                      : 'Você não possui nenhum serviço ativo atribuído a você no momento.'}
                  </p>
                </div>
              </div>
            ) : (
              tickets.map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-100 dark:hover:bg-white/[0.01] transition-all group gap-4 border border-slate-200/60 dark:border-white/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 items-center justify-center text-slate-500 group-hover:bg-blue-600/10 group-hover:text-blue-600 group-hover:border-blue-500/20 transition-colors shrink-0">
                      <ClipboardList size={24} />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{ticket.title}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                          {ticket.category || 'Geral'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
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
                  <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 sm:border-none pt-4 sm:pt-0 shrink-0">
                    {ticket.assignedToId && (
                      <Link href={`/tickets/${ticket.id}/chat`} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all shadow-sm">
                        <MessageSquare size={14} /> Chat
                      </Link>
                    )}
                    <Link href={`/tickets/${ticket.id}`} className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 shadow-sm">
                      Acessar <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
