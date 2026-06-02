'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Star, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  FileText,
  User,
  Zap,
  CheckCircle2
} from 'lucide-react';

type TechStats = {
  balance: number;
  escrowBalance: number;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  pendingProposals: number;
  totalEarned: number;
  platformFee: number;
  netEarnings: number;
};

export default function TechnicianDashboardPage() {
  const { token, userType } = useSessionStore();

  const statsQuery = useQuery({
    queryKey: ['tech-stats'],
    queryFn: () => apiGet<TechStats>('/users/me/stats'),
    enabled: !!token
  });

  const ticketsQuery = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => apiGet<{ data: any[] }>('/tickets'),
    enabled: !!token
  });

  const stats = statsQuery.data;
  const tickets = ticketsQuery.data?.data || [];

  if (!token || (userType !== 'technician' && userType !== 'company')) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight">Acesso Restrito</h1>
          <p className="text-slate-500">Esta página é exclusiva para prestadores de serviço credenciados.</p>
          <Link href="/login" className="btn-primary inline-flex px-10 py-3">Fazer Login</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-12 sm:px-6 bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">SaaS CRM Painel de Controle</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Dashboard <span className="premium-gradient-text">Financeiro</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Gerencie seus lucros, chamados e reputação na palma da mão.</p>
        </div>
        
        <Link href="/opportunities" className="btn-primary flex items-center gap-2 px-8 py-4 shadow-blue-600/20">
          <Briefcase size={18} /> Ver Vagas no Marketplace
        </Link>
      </header>

      {/* Grid Financeiro Principal */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {/* Card 1: Faturamento Bruto */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card bg-white dark:bg-[#111] p-8 flex flex-col justify-between border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faturamento Total</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-slate-900 dark:text-white">R$ {Number(stats?.totalEarned || 0).toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Comissão de 15% inclusa</p>
          </div>
        </motion.div>

        {/* Card 2: Saldo Disponível */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card bg-white dark:bg-[#111] p-8 flex flex-col justify-between border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Disponível</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-slate-900 dark:text-white">R$ {Number(stats?.balance || 0).toFixed(2)}</p>
            <button 
              onClick={() => alert('Solicitação de saque de BRL enviada! Processando Pix em até 24h úteis.')}
              className="mt-4 text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all outline-none"
            >
              Solicitar Saque <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Card 3: Saldo Protegido (Escrow) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card bg-white dark:bg-[#111] p-8 flex flex-col justify-between border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retido em Escrow</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-slate-900 dark:text-white">R$ {Number(stats?.escrowBalance || 0).toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Liberado após chamado resolvido</p>
          </div>
        </motion.div>

        {/* Card 4: Lucro Líquido */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card bg-white dark:bg-[#111] p-8 flex flex-col justify-between border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendimento Líquido</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-4xl font-black text-slate-900 dark:text-white">R$ {Number(stats?.netEarnings || 0).toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Líquido TechFix: R$ {Number(stats?.platformFee || 0).toFixed(2)} tarifa</p>
          </div>
        </motion.div>
      </section>

      {/* Gráfico SVG customizado & Reputação */}
      <section className="grid gap-8 lg:grid-cols-3 mb-12">
        {/* Gráfico Financeiro */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-[#111] p-8 border border-slate-100 dark:border-white/5 shadow-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold">Resumo Financeiro Anual</h3>
            <p className="text-xs text-slate-500">Estimativa mensal de faturamento líquido (PIX / Cartão)</p>
          </div>

          {/* Gráfico Custom SVG */}
          <div className="h-64 w-full relative flex items-end">
            <svg viewBox="0 0 600 200" className="w-full h-full text-blue-500">
              {/* Grids */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Line Area */}
              <path
                d="M 50,180 A 10,10 0 0,0 50,180 L 150,140 Q 250,70 350,110 T 550,40 M 50,180 L 50,180 M 550,40"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-blue-600 dark:text-blue-500 drop-shadow-[0_4px_10px_rgba(59,130,246,0.3)]"
              />
              
              {/* Posições mensais */}
              <circle cx="50" cy="180" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx="150" cy="140" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx="250" cy="90" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx="350" cy="110" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx="450" cy="70" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
              <circle cx="550" cy="40" r="6" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
            </svg>
            
            {/* Labels meses */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10 text-[9px] font-black uppercase tracking-widest text-slate-400 pt-2">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Reputação CRM Card */}
        <div className="glass-card bg-white dark:bg-[#111] p-8 border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Reputação & Reviews</h3>
            <p className="text-xs text-slate-500">Métricas de satisfação calculadas por IA</p>
          </div>

          <div className="py-6 text-center space-y-4">
            <p className="text-6xl font-black text-blue-600 dark:text-blue-500">{stats?.rating || '0.0'}</p>
            <div className="flex justify-center gap-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={18} 
                  className={s <= (stats?.rating || 0) ? 'fill-current' : 'opacity-20'} 
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">({stats?.totalReviews || 0} avaliações reais)</p>
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex justify-between text-xs font-bold text-slate-400">
            <span>Conversão de Orçamentos</span>
            <span className="text-blue-500">84%</span>
          </div>
        </div>
      </section>

      {/* Agenda & Chamados Ativos */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Chamados Recentes */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-[#111] p-8 border border-slate-100 dark:border-white/5 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-lg font-bold">Meus Chamados Recentes</h3>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">{tickets.length} total</span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-slate-100 dark:border-white/5 rounded-2xl p-5 bg-slate-50/20 dark:bg-white/[0.01] flex justify-between items-center hover:border-blue-500/30 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ticket.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span className="text-blue-600">{ticket.category || 'Geral'}</span>
                  </div>
                </div>
                <Link href={`/tickets/${ticket.id}`} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                  <ArrowUpRight size={18} className="text-blue-500" />
                </Link>
              </div>
            ))}

            {tickets.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Briefcase className="mx-auto mb-3 opacity-20" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Nenhum chamado atribuído ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Agenda Pessoal */}
        <div className="glass-card bg-white dark:bg-[#111] p-8 border border-slate-100 dark:border-white/5 shadow-2xl space-y-6">
          <h3 className="text-lg font-bold border-b border-slate-100 dark:border-white/5 pb-4">📅 Próximos Agendamentos</h3>
          
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-xl p-3 text-center shrink-0">
                <p className="text-xs font-bold uppercase">Jun</p>
                <p className="text-xl font-black leading-none mt-0.5">02</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Instalação Condensadora</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Visita Técnica às 14:00 - Residência</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-600 text-white rounded-xl p-3 text-center shrink-0">
                <p className="text-xs font-bold uppercase">Jun</p>
                <p className="text-xl font-black leading-none mt-0.5">05</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Reparo Quadro Elétrico</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Visita Técnica às 09:30 - Comercial</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-emerald-600 text-white rounded-xl p-3 text-center shrink-0">
                <p className="text-xs font-bold uppercase">Jun</p>
                <p className="text-xl font-black leading-none mt-0.5">08</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Manutenção Preventiva Split</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Visita Técnica às 16:00 - Residência</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
