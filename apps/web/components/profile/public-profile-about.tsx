import { Award, Zap } from 'lucide-react';

type PublicProfileAboutProps = {
  profile: any;
};

export function PublicProfileAbout({ profile }: PublicProfileAboutProps) {
  return (
    <div className="space-y-8">
      {/* About Section */}
      <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#111119]">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
          <Zap size={16} className="text-cyan-500" /> Sobre o Profissional
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {profile.bio || 'Este profissional ainda não adicionou uma biografia detalhada. Porém, sua presença em nossa plataforma indica comprometimento com a qualidade.'}
        </p>

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="mt-8">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Áreas de Atuação</h4>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((specialty: string) => (
                <span 
                  key={specialty} 
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-black tracking-wide border border-slate-200 dark:border-white/10"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Certificates Section */}
      {profile.certificates && profile.certificates.length > 0 && (
        <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 shadow-sm bg-white dark:bg-[#111119]">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
            <Award size={16} className="text-amber-500" /> Certificações e Diplomas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.certificates.map((cert: string, idx: number) => (
              <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 cursor-pointer">
                <img 
                  src={cert} 
                  alt={`Certificado ${idx + 1}`} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Ampliar
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
