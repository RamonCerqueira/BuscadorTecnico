'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ShieldCheck,
  Star,
  Building2,
  FileText,
  CheckCircle,
  Briefcase,
  Clock,
  ThumbsUp,
  Map,
  Truck,
  CreditCard,
  AlertCircle,
  X,
  Send,
  Navigation,
} from 'lucide-react';
import { PublicPortfolioGrid } from '../public-portfolio-grid';
import { PublicServiceMenu } from '../public-service-menu';
import { PublicFaqAccordion } from '../public-faq-accordion';

export function CompanyProfileTemplate({ profile, portfolioItems }: { profile: any; portfolioItems: any[] }) {
  const router = useRouter();

  // Direct Hire Modal States
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [hireLocation, setHireLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch logged-in user (client) info
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<any>('/users/me'),
    retry: false,
  });

  // Prefill location once client info is loaded
  useEffect(() => {
    if (me) {
      const addressParts = [];
      if (me.address) addressParts.push(me.address);
      if (me.city) addressParts.push(me.city);
      if (me.state) addressParts.push(me.state);
      setHireLocation(addressParts.join(', '));
    }
  }, [me]);

  const hireMutation = useMutation({
    mutationFn: async () => {
      // 1. Create the direct ticket
      const ticket = await apiPost<any>('/tickets', {
        title: `Solicitação Comercial - ${profile.companyName || profile.name}`,
        description: hireMessage,
        locationText: hireLocation || 'À combinar',
        category: profile.specialties?.[0] || 'Geral',
        assignedToId: profile.id,
      });

      // 2. Send the first message in the chat
      await apiPost(`/tickets/${ticket.id}/messages`, {
        content: hireMessage,
      });

      return ticket;
    },
    onSuccess: (ticket) => {
      setIsHireModalOpen(false);
      setHireMessage('');
      router.push(`/tickets/${ticket.id}/chat`);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Falha ao iniciar negociação. Tente novamente.');
    },
  });

  const handleHireClick = () => {
    if (!me) {
      router.push(`/login?redirect=/profile/${profile.id}`);
      return;
    }
    if (me.userType === 'technician' || me.userType === 'company') {
      alert('Apenas clientes podem solicitar orçamentos.');
      return;
    }
    setIsHireModalOpen(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            const street = addr.road || addr.pedestrian || addr.street || '';
            const number = addr.house_number || '';
            const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
            const city = addr.city || addr.town || addr.village || '';
            const state = addr.state || '';

            const parts = [];
            if (street) parts.push(number ? `${street}, ${number}` : street);
            if (neighborhood) parts.push(neighborhood);
            if (city) parts.push(city);
            if (state) parts.push(state);

            setHireLocation(parts.join(', '));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
        alert('Não foi possível obter sua localização atual.');
      }
    );
  };

  // Generate an abstract background for the company
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-indigo-950 via-zinc-900 to-[#07070a]',
    'from-violet-950 via-zinc-900 to-[#07070a]',
    'from-zinc-900 via-zinc-900 to-[#07070a]',
  ];
  const bgGradient = gradients[gradientId];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Company Header (B2B Style) */}
      <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm relative z-10">
        <div className={`h-48 md:h-60 w-full bg-gradient-to-r ${bgGradient} relative flex items-center justify-center border-b border-zinc-200/10 dark:border-zinc-850`}>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
          <Building2 size={64} className="text-white/[0.04] absolute" />
        </div>

        <div className="px-6 md:px-10 pb-8 relative -mt-16 flex flex-col md:flex-row gap-6 items-center md:items-end">
          {/* Square Avatar for Company */}
          <div className="h-32 w-32 rounded-2xl bg-white dark:bg-[#0c0c0e] border-4 border-white dark:border-[#0c0c0e] overflow-hidden flex items-center justify-center shadow-md shrink-0 z-10 p-2">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-contain" />
            ) : (
              <Building2 size={40} className="text-zinc-400 dark:text-zinc-650" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3 pb-1">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {profile.companyName || profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-indigo-500/80" />
                  {profile.city}, {profile.state}
                </span>
                <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                <span className="flex items-center gap-1 text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                  <Star size={11} fill="currentColor" />
                  <span className="text-[10px] font-bold">
                    {Number(profile.rating || 0).toFixed(1)} ({profile.totalReviews || 0})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
              {profile.kycStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/10">
                  <ShieldCheck size={11} /> Empresa Verificada
                </span>
              )}
              {profile.cnpj && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/10">
                  <FileText size={11} /> CNPJ Validado
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="w-full md:w-auto shrink-0 pb-1">
            <button
              onClick={handleHireClick}
              className="w-full md:w-auto rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <Briefcase size={14} /> Solicitar Orçamento
            </button>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Corporate Metrics, Compliance & NR rules) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Operations Trust Panel */}
          <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2">
              <Building2 size={14} className="text-indigo-500" /> Detalhes Corporativos
            </h3>

            <div className="space-y-4">
              {/* Horário */}
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Disponibilidade
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Seg. a Sex. 08h às 18h / Sáb. 08h às 12h
                  </span>
                </div>
              </div>

              {/* SLA de Resposta */}
              <div className="flex items-start gap-3">
                <ThumbsUp size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    SLA de Atendimento
                  </span>
                  <span className="text-xs font-semibold text-emerald-555 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Geralmente responde em &lt; 1 hora
                  </span>
                </div>
              </div>

              {/* Cobertura Operacional */}
              <div className="flex items-start gap-3">
                <Map size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Clientes Alvo
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Indústrias, Comércios e Condomínios (B2B)
                  </span>
                </div>
              </div>

              {/* Frota Própria */}
              <div className="flex items-start gap-3">
                <Truck size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Frota Logística
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Veículos próprios equipados e identificados
                  </span>
                </div>
              </div>

              {/* Condições de Pagamento */}
              <div className="flex items-start gap-3">
                <CreditCard size={16} className="text-zinc-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Condições de Faturamento
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    NF-e, Boleto Faturado, Pix e Cartão
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance & Certifications Panel */}
          <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" /> Conformidade & Segurança
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-650 dark:text-zinc-400">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                CNPJ Ativo e CND Regularizada
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-655 dark:text-zinc-400">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                Seguro de Responsabilidade Civil Ativo
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-655 dark:text-zinc-400">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                Técnicos Certificados em NR-10 e NR-35
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-655 dark:text-zinc-400">
                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                Emite Termo de Garantia por Serviço
              </div>
            </div>
          </section>

          <PublicFaqAccordion faqs={profile.faqs} />
        </div>

        {/* Right Column (About / Specialties, Portfolios, Services Menu) */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-555 flex items-center gap-2 mb-4">
              <Building2 size={14} className="text-indigo-500" /> Perfil Institucional
            </h3>
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium">
              {profile.bio ||
                'Empresa especializada em prestação de serviços de excelência técnica para condomínios e indústrias.'}
            </p>

            {profile.specialties && profile.specialties.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
                <h4 className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider mb-3">
                  Especialidades de Atendimento
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

          <PublicServiceMenu services={profile.services} />
          <PublicPortfolioGrid portfolioItems={portfolioItems} />
        </div>
      </div>

      {/* Direct Hire Modal Overlay */}
      <AnimatePresence>
        {isHireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left space-y-6"
            >
              <button
                onClick={() => setIsHireModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Building2 size={18} className="text-indigo-500" /> Solicitar Orçamento Comercial
                </h3>
                <p className="text-xs text-zinc-555 dark:text-zinc-500 font-medium">
                  Envie os detalhes da demanda para a equipe da empresa iniciar seu atendimento no chat.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Sua mensagem inicial
                  </label>
                  <textarea
                    rows={4}
                    value={hireMessage}
                    onChange={(e) => setHireMessage(e.target.value)}
                    placeholder="Olá! Gostaríamos de solicitar um orçamento comercial para..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Endereço da demanda
                    </label>
                    <button
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="text-[10px] font-semibold text-indigo-500 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <Navigation size={10} /> Usar GPS
                    </button>
                  </div>
                  <input
                    type="text"
                    value={hireLocation}
                    onChange={(e) => setHireLocation(e.target.value)}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsHireModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 py-3 text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => hireMutation.mutate()}
                  disabled={hireMutation.isPending || !hireMessage.trim() || !hireLocation.trim()}
                  className="flex-1 rounded-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-3 text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={12} />
                  {hireMutation.isPending ? 'Enviando...' : 'Solicitar Orçamento'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
