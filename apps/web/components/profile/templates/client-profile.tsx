import { MapPin, ShieldCheck, User, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

export function ClientProfileTemplate({ profile }: { profile: any }) {
  // Generate an abstract background for the client
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-slate-600 via-slate-700 to-slate-900',
    'from-slate-700 via-zinc-800 to-neutral-900',
    'from-gray-600 via-gray-800 to-black'
  ];
  const bgGradient = gradients[gradientId];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Client Header */}
      <section className="glass-card overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-xl shadow-black/5 dark:bg-[#111119]">
        <div className={`h-32 w-full bg-gradient-to-r ${bgGradient} relative`}>
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 items-center md:items-end">
          <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-slate-100 dark:bg-[#0c0d12] border-4 border-white dark:border-[#111119] overflow-hidden flex items-center justify-center shadow-2xl shrink-0 z-10">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <User size={48} className="text-slate-300 dark:text-slate-600" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
              {profile.name} 
              <span title="Usuário Autenticado" className="flex items-center"><ShieldCheck size={20} className="text-blue-500" /></span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-rose-500" />
                {profile.city || 'Cidade'}, {profile.state || 'UF'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-blue-500" />
                Membro desde {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reputation */}
      <section className="glass-card p-6 md:p-10 border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
          <ThumbsUp size={16} className="text-emerald-500" /> Reputação como Contratante
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{profile.rating || '5.0'}</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mt-1">Nota Média</p>
          </div>
          
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center flex flex-col justify-center">
            <MessageSquare size={28} className="mx-auto text-blue-500 mb-2" />
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Bom Pagador</h4>
            <p className="text-[10px] font-bold text-slate-500 mt-1">100% dos técnicos recomendam</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 text-center">
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Por motivos de privacidade, os dados completos de contato e endereço deste cliente só serão exibidos após a aceitação de um orçamento ou serviço.
          </p>
        </div>
      </section>
    </div>
  );
}
