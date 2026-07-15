import {
  PlusCircle,
  Search,
  ClipboardList,
  MessageSquare,
  User,
  Zap,
  Wallet,
  Brain,
  MapPin,
  Briefcase,
  Star,
} from 'lucide-react';
import Link from 'next/link';

type DashboardQuickActionsProps = {
  userType: string;
};

export function DashboardQuickActions({ userType }: DashboardQuickActionsProps) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-left pl-1">
        Ações Rápidas
      </h3>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 
        Flex scroll on mobile, structured grid on desktop.
        snap-x ensures smooth mobile swiping.
      */}
      <div className="flex lg:grid overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-4 snap-x snap-mandatory scrollbar-hide lg:grid-cols-5 xl:grid-cols-9">
        {/* Buttons for Client */}
        {userType === 'client' && (
          <>
            <Link
              href="/tickets/new"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <PlusCircle size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Novo Chamado
              </h4>
            </Link>

            <Link
              href="/companies"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Search size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Buscar Técnicos
              </h4>
            </Link>

            <Link
              href="/ai-diagnostic"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Brain size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Ajuda com IA
              </h4>
            </Link>

            <Link
              href="/tickets"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <ClipboardList size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Meus Pedidos
              </h4>
            </Link>

            <Link
              href="/profile"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <User size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Meu Perfil
              </h4>
            </Link>

            <Link
              href="/dashboard/reputation"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Star size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Reputação
              </h4>
            </Link>

            <Link
              href="#"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Wallet size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Carteira
              </h4>
            </Link>

            <Link
              href="#"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <MapPin size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Meus Locais
              </h4>
            </Link>

            <Link
              href="#"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Falar Conosco
              </h4>
            </Link>
          </>
        )}

        {/* Buttons for Technician / Company */}
        {(userType === 'technician' || userType === 'company') && (
          <>
            <Link
              href="/opportunities"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Briefcase size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                {userType === 'company' ? 'Novos Clientes' : 'Oportunidades'}
              </h4>
            </Link>

            <Link
              href="/tickets"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <ClipboardList size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                {userType === 'company' ? 'Serviços Ativos' : 'Meus Trabalhos'}
              </h4>
            </Link>

            <Link
              href="/technician/dashboard"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Wallet size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                {userType === 'company' ? 'Faturamento' : 'Meu Extrato'}
              </h4>
            </Link>

            <Link
              href="/subscription"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Zap size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                {userType === 'company' ? 'Plano Empresa' : 'Assinatura Pro'}
              </h4>
            </Link>

            <Link
              href="/profile"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <User size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                {userType === 'company' ? 'Perfil Empresa' : 'Meu Currículo'}
              </h4>
            </Link>

            <Link
              href="/ai-diagnostic"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Brain size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Laudos IA
              </h4>
            </Link>

            <Link
              href="/dashboard/reputation"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <Star size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Reputação
              </h4>
            </Link>

            <Link
              href="/dashboard/b2b"
              className="flex-1 lg:flex-none snap-start min-w-[125px] lg:min-w-0 bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-28 transition-all duration-300 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-[0.98] group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-10 h-10 bg-indigo-500/[0.02] rounded-full blur-lg pointer-events-none group-hover:bg-indigo-500/5 transition-colors" />
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:bg-indigo-500/5 dark:group-hover:bg-indigo-500/10 transition-all shrink-0">
                <MessageSquare size={18} />
              </div>
              <h4 className="font-semibold text-xs mt-3.5 tracking-wide text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors leading-tight">
                Suporte B2B
              </h4>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
