'use client';

import { motion } from 'framer-motion';
import { useSessionStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import Link from 'next/link';
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
  TrendingUp
} from 'lucide-react';

type Ticket = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  paymentStatus?: string;
};

type UserProfile = {
  name: string;
  userType: string;
  subscriptionActive: boolean;
  balance: number;
  escrowBalance: number;
  rating: number;
  totalReviews: number;
};

export default function DashboardPage() {
  const { userType, token } = useSessionStore();
  
  const ticketsQuery = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => apiGet<{ data: Ticket[] }>('/tickets'),
    enabled: !!token
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

  const tickets = ticketsQuery.data?.data || [];
  const profile = profileQuery.data;
  const isInactiveProfessional = (userType === 'technician' || userType === 'company') && !profile?.subscriptionActive;

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
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 transition-colors duration-300">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Command Center</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Olá, <span className="premium-gradient-text capitalize">{profile?.name.split(' ')[0] || 'você'}</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Confira o status das suas atividades hoje.</p>
        </motion.div>

        <div className="flex items-center gap-4">
           {userType === 'client' ? (
              <Link href="/tickets/new" className="btn-primary flex items-center gap-2 px-8 py-4 shadow-blue-600/20">
                <PlusCircle size={20} /> Novo Chamado
              </Link>
           ) : (
              <Link href="/opportunities" className="btn-primary flex items-center gap-2 px-8 py-4 shadow-blue-600/20">
                <Search size={20} /> Buscar Vagas
              </Link>
           )}
        </div>
      </header>

      {isInactiveProfessional && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <h4 className="text-xl font-black">Marketplace Bloqueado</h4>
              <p className="text-slate-500 font-medium">Sua assinatura expirou. Ative agora para voltar a receber orçamentos e lucrar.</p>
            </div>
          </div>
          <Link href="/subscription" className="btn-primary px-10 py-4 shadow-blue-600/20">Ativar Plano Pro</Link>
        </motion.div>
      )}

      {/* Stats & Wallet Grid */}
      <section className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12 sm:mb-16">
        {userType !== 'client' ? (
          <>
            <div className="glass-card p-8 flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Liberado</span>
                <Wallet className="text-emerald-500" size={20} />
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-slate-900 dark:text-white">R$ {Number(profile?.balance || 0).toFixed(2)}</p>
                <button className="mt-4 text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Solicitar Saque <ArrowRight size={14} /></button>
              </div>
            </div>
            <div className="glass-card p-8 flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Em Escrow (Seguro)</span>
                <Clock className="text-blue-500" size={20} />
              </div>
              <div className="mt-6">
                <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {Number(profile?.escrowBalance || 0).toFixed(2)}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tight">Liberado após conclusão</p>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 flex flex-col justify-between">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meus Pedidos</span>
                <ClipboardList className="text-blue-500" size={20} />
             </div>
             <div className="mt-6">
                <p className="text-4xl font-black">{tickets.length}</p>
                <p className="text-xs text-slate-500 font-bold mt-2">Chamados ativos no momento</p>
             </div>
          </div>
        )}

        <div className="glass-card p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reputação</span>
            <Star className="text-amber-500" size={20} />
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black">{profile?.rating || '0.0'}</p>
            <div className="flex items-center gap-1 mt-2 text-amber-500">
               {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (profile?.rating || 0) ? 'fill-current' : 'opacity-20'} />)}
               <span className="text-[10px] text-slate-500 font-black ml-2 uppercase">({profile?.totalReviews} Reviews)</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-blue-600/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notificações</span>
            <div className="relative">
              <Bell className="text-slate-400" size={20} />
              {notificationsQuery.data?.some(n => !n.read) && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-[#111]" />}
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-4xl font-black">{notificationsQuery.data?.filter(n => !n.read).length || 0}</p>
            <p className="text-xs text-slate-500 font-bold mt-2">Alertas não lidos</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
        {/* Atividades Recentes */}
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black tracking-tight">Atividades <span className="text-blue-600">Recentes</span></h2>
             <Link href="/tickets" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">Ver tudo</Link>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="glass-card p-16 text-center text-slate-400 border-dashed">
                <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold">Nenhuma atividade recente encontrada.</p>
              </div>
            ) : (
              tickets.slice(0, 5).map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-slate-100 dark:bg-white/5 items-center justify-center text-slate-400 group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-colors">
                      <ClipboardList size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg group-hover:text-blue-600 transition-colors">{ticket.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'resolved' ? 'text-emerald-500' : 'text-blue-600'}`}>{ticket.status}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/tickets/${ticket.id}`} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    <ArrowUpRight size={20} />
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Notificações Detalhadas */}
        <section className="space-y-8">
           <h2 className="text-2xl font-black tracking-tight">Notificações</h2>
           <div className="space-y-4">
              {notificationsQuery.isLoading && <div className="h-20 w-full animate-pulse bg-slate-100 dark:bg-white/5 rounded-2xl" />}
              {notificationsQuery.data?.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">Tudo limpo por aqui! ✨</p>}
              {notificationsQuery.data?.slice(0, 4).map((n, i) => (
                <div key={n.id} className={`glass-card p-5 border-l-4 ${n.read ? 'border-slate-200 dark:border-white/5' : 'border-blue-600'} transition-all`}>
                   <div className="flex justify-between items-start mb-2">
                      <h5 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">{n.title}</h5>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(n.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{n.message}</p>
                   {!n.read && (
                      <button className="mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest">Marcar como lida</button>
                   )}
                </div>
              ))}
           </div>
        </section>
      </div>
    </main>
  );
}
