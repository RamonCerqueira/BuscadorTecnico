import { Award, Zap } from 'lucide-react';

type PublicProfileAboutProps = {
  profile: any;
};

export function PublicProfileAbout({ profile }: PublicProfileAboutProps) {
  return (
    <div className="space-y-8">
      {/* About Section */}
      <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2 mb-4">
          <Zap size={14} className="text-indigo-500" /> Sobre o Profissional
        </h3>
        <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
          {profile.bio ||
            'Este profissional ainda não adicionou uma biografia detalhada. Porém, sua presença em nossa plataforma indica comprometimento com a qualidade.'}
        </p>

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Áreas de Atuação
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.specialties.map((specialty: string) => (
                <span
                  key={specialty}
                  className="px-3 py-1 rounded-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide"
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
        <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2 mb-6">
            <Award size={14} className="text-amber-500" /> Certificações e Diplomas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.certificates.map((cert: string, idx: number) => (
              <div
                key={idx}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer"
              >
                <img
                  src={cert}
                  alt={`Certificado ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-semibold text-[10px] bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm tracking-wide">
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
