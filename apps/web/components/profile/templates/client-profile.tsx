import { MapPin, ShieldCheck, User, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';

export function ClientProfileTemplate({ profile }: { profile: any }) {
  // Generate an abstract background for the client
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-zinc-800 via-zinc-900 to-[#07070a]',
    'from-zinc-900 via-zinc-950 to-[#07070a]',
    'from-zinc-950 via-zinc-900 to-[#07070a]',
  ];
  const bgGradient = gradients[gradientId];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Client Header */}
      <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm relative z-10">
        <div className={`h-32 w-full bg-gradient-to-r ${bgGradient} relative`}>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />
        </div>

        <div className="px-6 md:px-10 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 items-center md:items-end">
          <div className="h-28 w-28 rounded-2xl bg-zinc-150 dark:bg-[#0c0c0e] border-4 border-white dark:border-[#0c0c0e] overflow-hidden flex items-center justify-center shadow-lg shrink-0 z-10 p-2">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-zinc-400 dark:text-zinc-650" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center md:justify-start gap-1.5">
              {profile.name}
              <span title="Usuário Autenticado" className="flex items-center">
                <ShieldCheck size={16} className="text-indigo-500" />
              </span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-semibold text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-indigo-500/80" />
                {profile.city || 'Cidade'}, {profile.state || 'UF'}
              </span>
              <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-indigo-500/80" />
                Membro desde {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Client Reputation */}
      <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2 mb-6">
          <ThumbsUp size={14} className="text-indigo-500" /> Reputação como Contratante
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.02] p-6 text-center">
            <h4 className="text-3xl font-extrabold text-emerald-650 dark:text-emerald-450">
              {Number(profile.rating || 5.0).toFixed(1)}
            </h4>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-450/70 mt-1.5">
              Nota Média
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.02] p-6 text-center flex flex-col justify-center items-center">
            <MessageSquare size={22} className="text-indigo-500 mb-2" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Bom Pagador</h4>
            <p className="text-[9px] font-semibold text-zinc-450 dark:text-zinc-500 mt-1 uppercase tracking-wide">
              100% dos técnicos recomendam
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 text-center">
          <p className="text-xs text-zinc-555 dark:text-zinc-450 font-medium max-w-sm mx-auto leading-relaxed">
            Por motivos de segurança, os dados completos de contato deste cliente só serão
            exibidos após a aceitação mútua de um orçamento.
          </p>
        </div>
      </section>
    </div>
  );
}
