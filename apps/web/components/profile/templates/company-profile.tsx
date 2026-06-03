import { MapPin, ShieldCheck, Star, Building2, Phone, Mail, FileText, CheckCircle, Briefcase } from 'lucide-react';
import { PublicPortfolioGrid } from '../public-portfolio-grid';
import { PublicServiceMenu } from '../public-service-menu';
import { PublicFaqAccordion } from '../public-faq-accordion';

export function CompanyProfileTemplate({ profile, portfolioItems }: { profile: any, portfolioItems: any[] }) {
  // Generate an abstract background for the company
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-indigo-900 via-slate-800 to-black',
    'from-slate-800 via-gray-900 to-black',
    'from-blue-900 via-slate-900 to-black'
  ];
  const bgGradient = gradients[gradientId];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Company Header (B2B Style) */}
      <section className="glass-card overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-xl shadow-black/5 dark:bg-[#111119]">
        <div className={`h-48 md:h-64 w-full bg-gradient-to-r ${bgGradient} relative flex items-center justify-center`}>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
           <Building2 size={80} className="text-white/10 absolute" />
        </div>
        
        <div className="px-6 md:px-10 pb-8 relative -mt-20 flex flex-col md:flex-row gap-8 items-center md:items-end">
          {/* Square Avatar for Company */}
          <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-[#0c0d12] border-4 border-white dark:border-[#111119] overflow-hidden flex items-center justify-center shadow-2xl shrink-0 z-10">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-contain p-2" />
            ) : (
              <Building2 size={48} className="text-slate-300 dark:text-slate-600" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{profile.companyName || profile.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-rose-500" />
                  {profile.city}, {profile.state}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-black">{profile.rating || '0.0'} ({profile.totalReviews || 0})</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              {profile.kycStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <ShieldCheck size={12} /> Empresa Verificada
                </span>
              )}
              {profile.cnpj && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <FileText size={12} /> CNPJ Validado
                </span>
              )}
            </div>
          </div>
          
          {/* CTA */}
          <div className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-sm font-black transition-transform hover:scale-105 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
              <Briefcase size={18} /> Orçamento Comercial
            </button>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-blue-500" /> Institucional
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {profile.bio || 'Empresa especializada em prestação de serviços de excelência técnica para condomínios e indústrias.'}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <CheckCircle size={16} className="text-emerald-500" /> Emissão de Nota Fiscal
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <CheckCircle size={16} className="text-emerald-500" /> Garantia Contratual
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <CheckCircle size={16} className="text-emerald-500" /> Frota Própria
              </div>
            </div>

            {profile.specialties && profile.specialties.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Áreas de Atuação</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty: string) => (
                    <span 
                      key={specialty} 
                      className="px-3 py-1.5 rounded-lg bg-blue-500/5 text-blue-700 dark:text-blue-300 text-xs font-black tracking-wide border border-blue-500/10"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <PublicFaqAccordion faqs={profile.faqs} />
        </div>

        {/* Right Column (Portfolio) */}
        <div className="lg:col-span-7 space-y-8">
          <PublicServiceMenu services={profile.services} />
          <PublicPortfolioGrid portfolioItems={portfolioItems} />
        </div>
      </div>
    </div>
  );
}
