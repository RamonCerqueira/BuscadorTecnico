import { Sparkles, Star, ClipboardList, Wallet, Bell, Clock, Briefcase, User } from 'lucide-react';
import Link from 'next/link';

type DashboardHeroProps = {
  userType: string;
  profile: any;
  ticketsCount: number;
  notificationsCount: number;
  children?: React.ReactNode;
};

export function DashboardHero({
  userType,
  profile,
  ticketsCount,
  notificationsCount,
  children
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 md:p-12 shadow-2xl text-white">
      {/* Absolute ambient light overlays */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 -ml-20 -mb-20 h-80 w-80 bg-indigo-500/10 dark:bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Coluna Esquerda: Boas-vindas e Conteúdo (Busca/Tags/Ações) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[10px] font-black uppercase tracking-widest w-fit">
            <Sparkles size={12} className="animate-pulse text-blue-400" />
            Painel de Controle
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Olá, <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent capitalize">{profile?.name?.split(' ')[0] || 'você'}</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm sm:text-base md:text-lg">
              {userType === 'client' 
                ? 'Gerencie seus chamados e contrate profissionais de elite com IA.' 
                : 'Confira o status das suas atividades, propostas e ganhos reais hoje.'}
            </p>
          </div>

          {/* Render Search form or Quick Links passed as children */}
          {children}
        </div>

        {/* Coluna Direita: Métricas Compactas Integradas (col-span-5) */}
        <div className="lg:col-span-5 space-y-4 w-full">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Status Geral</h4>
          
          {/* Métrica 1: Avaliação */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Star size={16} className="fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Minha Avaliação</p>
                <div className="flex text-amber-500 gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={8} className={s <= (profile?.rating || 0) ? 'fill-current' : 'opacity-20'} />)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white">{profile?.rating || '0.0'}</span>
            </div>
          </div>

          {/* Métrica 2: Client or Pro */}
          {userType === 'client' ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <ClipboardList size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Chamados Ativos</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Abertos ou em andamento</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white">{ticketsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Saldo Disponível</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Disponível para Pix</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">R$ {Number(profile?.balance || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Métrica 3: Client vs Pro */}
          {userType === 'client' ? (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Alertas Pendentes</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Ações necessárias</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-rose-500">{notificationsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Garantias (Escrow)</p>
                  <p className="text-[8px] text-slate-500 mt-0.5">Retido pelo TechFix</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-400">R$ {Number(profile?.escrowBalance || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
