'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch } from '@/lib/api/client';
import {
  User,
  Award,
  MapPin,
  Plus,
  X,
  Save,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Clock,
  ThumbsUp,
  Map,
  CreditCard,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Operational states
  const [operatingHours, setOperatingHours] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [coverageArea, setCoverageArea] = useState('');
  const [contractWarranty, setContractWarranty] = useState('');
  const [paymentMethods, setPaymentMethods] = useState('');

  // Compliance checklist states
  const [insuranceActive, setInsuranceActive] = useState(false);
  const [nr10Certified, setNr10Certified] = useState(false);
  const [nr35Certified, setNr35Certified] = useState(false);
  const [emitsNFe, setEmitsNFe] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<any>('/users/me'),
  });

  // Sync API data with local states
  useEffect(() => {
    if (profileQuery.data) {
      setBio(profileQuery.data.bio || '');
      setSpecialties(profileQuery.data.specialties || []);
      setOperatingHours(profileQuery.data.operatingHours || '');
      setResponseTime(profileQuery.data.responseTime || '');
      setCoverageArea(profileQuery.data.coverageArea || '');
      setContractWarranty(profileQuery.data.contractWarranty || '');
      setPaymentMethods(profileQuery.data.paymentMethods || '');
      setInsuranceActive(!!profileQuery.data.insuranceActive);
      setNr10Certified(!!profileQuery.data.nr10Certified);
      setNr35Certified(!!profileQuery.data.nr35Certified);
      setEmitsNFe(!!profileQuery.data.emitsNFe);
    }
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: any) => apiPatch('/users/me', values),
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => setIsSaved(false), 3000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      bio,
      specialties,
      operatingHours,
      responseTime,
      coverageArea,
      contractWarranty,
      paymentMethods,
      insuranceActive,
      nr10Certified,
      nr35Certified,
      emitsNFe,
    });
  };

  const addTag = () => {
    if (newTag && !specialties.includes(newTag)) {
      setSpecialties([...specialties, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setSpecialties(specialties.filter((t) => t !== tag));

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 bg-zinc-50 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <form onSubmit={handleSave} className="space-y-8">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              Painel de Configuração
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Configure seu Perfil de Elite
            </h1>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Aumente suas taxas de contratação preenchendo seus dados operacionais e selos de
              conformidade B2B.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            disabled={saveMutation.isPending}
          >
            <Save size={14} />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </header>

        {isSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3 rounded-2xl bg-emerald-500/5 p-4 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-xs font-semibold"
          >
            <CheckCircle2 size={16} />
            <span>Perfil atualizado com sucesso! Suas alterações estão ativas no catálogo.</span>
          </motion.div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main settings column */}
          <section className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
                <User size={16} className="text-indigo-500" /> Biografia Profissional
              </h2>
              <textarea
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:border-indigo-500/50 focus:outline-none focus:ring-0 transition-all min-h-[160px] resize-none"
                placeholder="Ex: Especialista em ar-condicionado com certificado Master. Atuo há 10 anos em toda grande SP..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-3 text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
                Dica: Conte sobre seus melhores equipamentos e anos de experiência.
              </p>
            </div>

            {/* Specialties & Tags */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md text-left">
              <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-zinc-900 dark:text-white">
                <Briefcase size={16} className="text-indigo-500" /> Especialidades e Tags
              </h2>
              <div className="flex gap-3 mb-6">
                <input
                  className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-500/50"
                  placeholder="Ex: Hidráulica, Drywall, Câmeras..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-10 w-10 rounded-xl bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.length === 0 && (
                  <p className="text-zinc-400 text-xs">Nenhuma especialidade adicionada ainda.</p>
                )}
                {specialties.map((tag) => (
                  <motion.span
                    layout
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {tag}
                    <X
                      size={13}
                      className="cursor-pointer text-zinc-400 hover:text-rose-500 transition-colors"
                      onClick={() => removeTag(tag)}
                    />
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Operational Info Settings */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-md text-left space-y-6">
              <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                <Clock size={16} className="text-indigo-500" /> Informações Operacionais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Horário de Atendimento
                  </label>
                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                    <Clock size={14} className="text-zinc-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-0 w-full"
                      placeholder="Ex: Seg. a Sáb. das 08h às 18h"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Tempo Médio de Resposta (SLA)
                  </label>
                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                    <ThumbsUp size={14} className="text-zinc-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-0 w-full"
                      placeholder="Ex: Responde em menos de 1 hora"
                      value={responseTime}
                      onChange={(e) => setResponseTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Área de Cobertura
                  </label>
                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                    <Map size={14} className="text-zinc-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-0 w-full"
                      placeholder="Ex: Grande São Paulo, ABCD e Litoral"
                      value={coverageArea}
                      onChange={(e) => setCoverageArea(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Garantia Oferecida
                  </label>
                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                    <ShieldCheck size={14} className="text-zinc-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-0 w-full"
                      placeholder="Ex: 90 dias de garantia técnica"
                      value={contractWarranty}
                      onChange={(e) => setContractWarranty(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Formas de Pagamento
                  </label>
                  <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                    <CreditCard size={14} className="text-zinc-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="bg-transparent border-none p-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:ring-0 w-full"
                      placeholder="Ex: Pix, Boleto Faturado (B2B), Cartões de Crédito"
                      value={paymentMethods}
                      onChange={(e) => setPaymentMethods(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right sidebar compliance check list */}
          <aside className="space-y-8">
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center shrink-0">
                  <Award size={18} className="text-indigo-500" />
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Conformidade & Selos
                </h2>
              </div>

              <div className="space-y-4">
                {/* Emite Nota Fiscal */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <FileText size={13} className="text-indigo-500" /> Emissão de NF-e
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-semibold leading-tight">
                      Empresa/Técnico emite Nota Fiscal
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emitsNFe}
                    onChange={(e) => setEmitsNFe(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* Seguro Ativo */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-indigo-500" /> Seguro de Danos
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-semibold leading-tight">
                      Seguro de Responsabilidade Civil ativo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={insuranceActive}
                    onChange={(e) => setInsuranceActive(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* NR-10 */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Certificação NR-10
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-semibold leading-tight">
                      Treinamento em segurança elétrica
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nr10Certified}
                    onChange={(e) => setNr10Certified(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* NR-35 */}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 cursor-pointer select-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      Certificação NR-35
                    </span>
                    <span className="text-[10px] text-zinc-400 block font-semibold leading-tight">
                      Treinamento em trabalho em altura
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={nr35Certified}
                    onChange={(e) => setNr35Certified(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Progress bar */}
              <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider">
                    Completude do Perfil
                  </span>
                  <span className="text-emerald-500 font-bold">Completo (100%)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-550 w-full transition-all duration-1000" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 backdrop-blur-md text-left space-y-3">
              <div className="flex items-center gap-2 text-zinc-650 dark:text-zinc-400">
                <MapPin size={16} className="text-indigo-500 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Raio de Cobertura</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Sua conta está configurada para atender chamados técnicos em um raio de{' '}
                <strong>{profileQuery.data?.radius || 20}km</strong> de sua localização base.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}
