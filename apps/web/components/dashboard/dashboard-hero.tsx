import { Sparkles, Star, ClipboardList, Wallet, Bell, Clock } from 'lucide-react';

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
  children,
}: DashboardHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0c0c0e]/80 p-8 md:p-10 shadow-2xl text-white">
      {/* Top Border Glow Accent */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -ml-20 -mb-20 h-80 w-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Welcome & Search form */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 text-[10px] font-semibold uppercase tracking-wider w-fit">
            <Sparkles size={11} className="animate-pulse text-indigo-400" />
            Painel de Controle
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Olá,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent capitalize">
                {profile?.name?.split(' ')[0] || 'você'}
              </span>
            </h1>
            <p className="text-zinc-400 font-medium text-sm sm:text-base leading-relaxed">
              {userType === 'client'
                ? 'Gerencie seus chamados e contrate profissionais de elite com suporte da nossa IA.'
                : 'Confira o status das suas atividades, propostas e ganhos reais hoje.'}
            </p>
          </div>

          {/* Search bar inside hero */}
          {children}
        </div>

        {/* Right Column: Premium Metric Cards */}
        <div className="lg:col-span-5 space-y-4 w-full">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-left pl-1">
            Status Geral
          </h4>

          {/* Metric 1: Rating */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/5 text-amber-400 border border-amber-500/10 flex items-center justify-center">
                <Star size={15} className="fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  Minha Avaliação
                </p>
                <div className="flex text-amber-500 gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={8}
                      className={s <= (profile?.rating || 0) ? 'fill-current' : 'opacity-20'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-white">
                {Number(profile?.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Metric 2: Active Tickets or Wallet Balance */}
          {userType === 'client' ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 flex items-center justify-center">
                  <ClipboardList size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Chamados Ativos
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Abertos ou em andamento</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{ticketsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 flex items-center justify-center">
                  <Wallet size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Saldo Disponível
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Disponível para Pix</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-400">
                  R$ {Number(profile?.balance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Metric 3: Alerts or Escrow */}
          {userType === 'client' ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-rose-500/5 text-rose-400 border border-rose-500/10 flex items-center justify-center">
                  <Bell size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Alertas Pendentes
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Ações necessárias</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-rose-400">{notificationsCount}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/60 transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 flex items-center justify-center">
                  <Clock size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Garantias (Escrow)
                  </p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Retido pelo TechFix</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-400">
                  R$ {Number(profile?.escrowBalance || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
