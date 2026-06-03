import { PlusCircle, Search, ClipboardList, MessageSquare, User, Zap, Wallet, Brain, MapPin, Briefcase, Star } from 'lucide-react';
import Link from 'next/link';

type DashboardQuickActionsProps = {
  userType: string;
};

export function DashboardQuickActions({ userType }: DashboardQuickActionsProps) {
  return (
    <section className="space-y-5">
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-left">Ações Rápidas</h3>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="flex overflow-x-auto pb-6 gap-3 snap-x snap-mandatory scrollbar-hide">
        
        {/* Buttons for Client */}
        {userType === 'client' && (
          <>
            <Link href="/tickets/new" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <PlusCircle size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-tight">Novo Chamado</h4>
              </div>
            </Link>

            <Link href="/companies" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Search size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-tight">Buscar Técnicos</h4>
              </div>
            </Link>

            <Link href="/ai-diagnostic" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Brain size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors leading-tight">Ajuda com IA</h4>
              </div>
            </Link>

            <Link href="/tickets" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">Meus Pedidos</h4>
              </div>
            </Link>

            <Link href="/profile" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <User size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-tight">Meu Perfil</h4>
              </div>
            </Link>

            <Link href="/dashboard/reputation" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Star size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors leading-tight">Reputação</h4>
              </div>
            </Link>

            <Link href="#" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Wallet size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors leading-tight">Carteira</h4>
              </div>
            </Link>

            <Link href="#" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <MapPin size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors leading-tight">Meus Locais</h4>
              </div>
            </Link>

            <Link href="#" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-slate-500/30 hover:bg-slate-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-slate-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-slate-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <MessageSquare size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-slate-500 transition-colors leading-tight">Falar Conosco</h4>
              </div>
            </Link>
          </>
        )}

        {/* Buttons for Technician / Company */}
        {(userType === 'technician' || userType === 'company') && (
          <>
            <Link href="/opportunities" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-blue-500/30 hover:bg-blue-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Briefcase size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-tight">
                  {userType === 'company' ? 'Novos Clientes' : 'Buscar Oportunidades'}
                </h4>
              </div>
            </Link>

            <Link href="/tickets" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <ClipboardList size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors leading-tight">
                  {userType === 'company' ? 'Serviços Ativos' : 'Meus Trabalhos'}
                </h4>
              </div>
            </Link>

            <Link href="/technician/dashboard" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Wallet size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">
                  {userType === 'company' ? 'Faturamento' : 'Meu Extrato'}
                </h4>
              </div>
            </Link>

            <Link href="/subscription" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Zap size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-tight">
                  {userType === 'company' ? 'Plano Empresa' : 'Assinatura Pro'}
                </h4>
              </div>
            </Link>

            <Link href="/profile" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <User size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-tight">
                  {userType === 'company' ? 'Perfil Empresa' : 'Meu Currículo'}
                </h4>
              </div>
            </Link>

            <Link href="/ai-diagnostic" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-cyan-500/30 hover:bg-cyan-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Brain size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors leading-tight">Laudos IA</h4>
              </div>
            </Link>

            <Link href="/dashboard/reputation" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-rose-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <Star size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors leading-tight">Reputação</h4>
              </div>
            </Link>

            <Link href="/dashboard/b2b" className="glass-card p-4 flex flex-col items-center justify-center group hover:border-slate-500/30 hover:bg-slate-500/[0.02] transition-all duration-300 relative overflow-hidden h-32 min-w-[130px] flex-1 snap-start">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 w-12 h-12 bg-slate-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-slate-500/10 transition-colors"></div>
              <div className="h-10 w-10 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <MessageSquare size={20} />
              </div>
              <div className="text-center mt-3">
                <h4 className="font-medium text-[13px] text-slate-900 dark:text-white group-hover:text-slate-500 transition-colors leading-tight">Suporte B2B</h4>
              </div>
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
