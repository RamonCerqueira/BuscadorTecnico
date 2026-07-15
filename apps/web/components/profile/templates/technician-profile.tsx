import { PublicProfileHero } from '../public-profile-hero';
import { PublicProfileAbout } from '../public-profile-about';
import { PublicPortfolioGrid } from '../public-portfolio-grid';
import { PublicServiceMenu } from '../public-service-menu';
import { PublicFaqAccordion } from '../public-faq-accordion';
import {
  Clock,
  ShieldCheck,
  CreditCard,
  Map,
  Wrench,
  ThumbsUp,
  FileSpreadsheet,
} from 'lucide-react';

export function TechnicianProfileTemplate({ profile, portfolioItems }: { profile: any; portfolioItems: any[] }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Technician Hero Section */}
      <PublicProfileHero profile={profile} />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Trust Dashboard, Operational Details & Compliance) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Trust and Operations Panel */}
          <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2">
              <Wrench size={14} className="text-indigo-500" /> Detalhes Operacionais
            </h3>

            <div className="space-y-4">
              {/* Horário de Atendimento */}
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Horário Comercial</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Seg. a Sáb. das 08h às 18h
                  </span>
                </div>
              </div>

              {/* Tempo de Resposta */}
              <div className="flex items-start gap-3">
                <ThumbsUp size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tempo de Resposta</span>
                  <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Geralmente responde em &lt; 1 hora
                  </span>
                </div>
              </div>

              {/* Área de Cobertura */}
              <div className="flex items-start gap-3">
                <Map size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Área de Atendimento</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Residencial, Comercial e Condomínios
                  </span>
                </div>
              </div>

              {/* Garantia do Serviço */}
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Garantia Contratual</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    90 dias inclusa em todos os serviços
                  </span>
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div className="flex items-start gap-3">
                <CreditCard size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Formas de Pagamento</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Pix, Cartão de Crédito (até 12x)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance & Verification details */}
          <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" /> Selos e Segurança
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                Antecedentes Criminais Verificados
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                Biometria Facial Facial Match
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                Telefone & E-mail Autenticados
              </div>
            </div>
          </section>

          <PublicFaqAccordion faqs={profile.faqs} />
        </div>

        {/* Right Column (About, Portfolio, Pricing Menu) */}
        <div className="lg:col-span-8 space-y-8">
          <PublicProfileAbout profile={profile} />
          <PublicServiceMenu services={profile.services} />
          <PublicPortfolioGrid portfolioItems={portfolioItems} />
        </div>
      </div>
    </div>
  );
}
