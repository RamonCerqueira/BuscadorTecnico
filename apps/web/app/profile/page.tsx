'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api/client';
import { FileUpload } from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Phone, Briefcase, Save, CheckCircle, X,
  ShieldCheck, ShieldAlert, ShieldOff, Clock, Camera, RefreshCw, Trash2, Plus, Bell
} from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type UserProfile = {
  id: string;
  name: string;
  email: string;
  userType: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  specialties: string[];
  certificates?: string[];
  // KYC
  kycStatus?: 'pending' | 'approved' | 'rejected';
  kycDetails?: string;
  kycCheckedAt?: string;
  livenessVerified?: boolean;
  selfieUrl?: string;
};

// Badge de status KYC
function KycBadge({ status, livenessVerified }: { status?: string; livenessVerified?: boolean }) {
  if (!status) return null;

  const config = {
    approved: {
      icon: <ShieldCheck size={14} className="shrink-0" />,
      label: 'Perfil Verificado',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
    pending: {
      icon: <Clock size={14} className="shrink-0 animate-pulse" />,
      label: 'Verificação em Andamento',
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    rejected: {
      icon: <ShieldAlert size={14} className="shrink-0" />,
      label: 'Pendência — Revise seus Documentos',
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    },
  };

  const current = config[status as keyof typeof config] || config.pending;

  return (
    <div className="flex flex-wrap gap-2 mt-2 justify-center">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${current.classes}`}>
        {current.icon} {current.label}
      </span>
      {livenessVerified && (
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
          <CheckCircle size={14} /> Identidade Confirmada
        </span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Seu navegador não suporta notificações push.');
      return;
    }

    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        
        let vapidResponse;
        try {
          vapidResponse = await apiGet<{ publicKey: string }>('/notifications/vapid-key');
        } catch (e) {
          alert('Erro ao obter chaves de notificação do servidor.');
          return;
        }

        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidResponse.publicKey),
        };

        const subscription = await reg.pushManager.subscribe(subscribeOptions);
        
        await apiPost('/notifications/subscribe', subscription);
        alert('Notificações push ativadas com sucesso!');
      } else {
        alert('Permissão de notificações recusada.');
      }
    } catch (err: any) {
      console.error('Erro ao assinar notificações push:', err);
      alert(`Falha ao assinar notificações push: ${err.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<UserProfile>('/users/me')
  });

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
        },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  // Liveness — upload de selfie
  const livenessMutation = useMutation({
    mutationFn: (selfieUrl: string) => apiPost('/users/upload-selfie', { selfieUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  // Acionar nova checagem KYC
  const kycMutation = useMutation({
    mutationFn: () => apiPost('/users/kyc/trigger', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  // Portfólio query e mutações
  const { data: portfolioItems } = useQuery({
    queryKey: ['portfolio', profile?.id],
    queryFn: () => apiGet<any[]>(`/portfolio/user/${profile?.id}`),
    enabled: !!profile?.id,
  });

  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('');
  const [portfolioBefore, setPortfolioBefore] = useState('');
  const [portfolioAfter, setPortfolioAfter] = useState('');
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  const createPortfolioMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; beforeUrl: string; afterUrl: string; category?: string }) => {
      return apiPost('/portfolio', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', profile?.id] });
      setPortfolioTitle('');
      setPortfolioDesc('');
      setPortfolioCategory('');
      setPortfolioBefore('');
      setPortfolioAfter('');
      setShowPortfolioForm(false);
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/portfolio/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', profile?.id] });
    }
  });

  const isTech = formData.userType === 'technician' || formData.userType === 'company';

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-slate-400">Gerencie suas informações e foto de perfil.</p>
      </header>

      <div className="space-y-8">
        {/* Avatar + KYC Badge */}
        <section className="glass-card p-6 flex flex-col items-center gap-4 text-center">
           <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-cyan-500/30">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
                  <User size={40} />
                </div>
              )}
           </div>

           {/* Badge KYC — visível apenas para técnicos/empresas */}
           {isTech && (
             <KycBadge status={formData.kycStatus} livenessVerified={formData.livenessVerified} />
           )}

           <div className="w-full">
            <FileUpload
              maxFiles={1}
              onUpload={(urls) => setFormData(prev => ({ ...prev, avatarUrl: urls[0] }))}
              label="Alterar Foto de Perfil"
            />
           </div>
        </section>

        {/* Seção KYC & Prova de Vida — apenas para técnicos/empresas */}
        {isTech && (
          <section className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Verificação de Identidade (KYC)</h3>
                <p className="text-xs text-slate-500">Certificados e prova de vida analisados por IA</p>
              </div>
            </div>

            {/* Status detalhado */}
            {formData.kycDetails && (
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Último Resultado</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{formData.kycDetails}</p>
                {formData.kycCheckedAt && (
                  <p className="text-[10px] text-slate-400 mt-2">
                    Verificado em: {new Date(formData.kycCheckedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            {/* Prova de Vida (Liveness) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Prova de Vida (Selfie)</p>
                  <p className="text-[11px] text-slate-500">Confirme sua identidade com uma selfie em tempo real</p>
                </div>
                {formData.livenessVerified && (
                  <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                    <CheckCircle size={12} /> Verificado
                  </span>
                )}
              </div>

              {formData.selfieUrl && (
                <div className="h-24 w-24 rounded-xl overflow-hidden border border-white/10">
                  <img src={formData.selfieUrl} alt="Selfie" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Input de câmera nativa */}
              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors w-full justify-center">
                <Camera size={16} className="text-blue-500" />
                {livenessMutation.isPending ? 'Analisando...' : 'Tirar Selfie para Verificação'}
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'selfies');

                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/uploads/file`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
                        },
                        body: formData
                      });
                      
                      if (!res.ok) throw new Error('Upload falhou');
                      
                      const data = await res.json();
                      livenessMutation.mutate(data.url);
                    } catch (error) {
                      console.error('Erro no upload da selfie:', error);
                    }
                  }}
                />
              </label>
            </div>

            {/* Acionar nova checagem */}
            <button
              onClick={() => kycMutation.mutate()}
              disabled={kycMutation.isPending}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-500 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={14} className={kycMutation.isPending ? 'animate-spin' : ''} />
              {kycMutation.isPending ? 'Iniciando verificação...' : 'Reacionar Checagem de Antecedentes'}
            </button>
          </section>
        )}

        {/* Info Section */}
        <section className="glass-card p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nome Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-white/5 bg-white/5 p-3 pl-12 text-sm focus:border-cyan-500/50 outline-none"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-3 pl-12 text-sm focus:border-cyan-500/50 outline-none"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cidade/Estado</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    className="w-full rounded-xl border border-white/5 bg-white/5 p-3 pl-12 text-sm focus:border-cyan-500/50 outline-none"
                    placeholder="Ex: São Paulo - SP"
                    value={formData.city ? `${formData.city} - ${formData.state || ''}` : ''}
                    onChange={(e) => {
                      const [city, state] = e.target.value.split('-').map(s => s.trim());
                      setFormData(prev => ({ ...prev, city, state }));
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio / Experiência</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-white/5 bg-white/5 p-3 text-sm focus:border-cyan-500/50 outline-none"
                placeholder="Conte um pouco sobre você ou sua empresa..."
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>

            {/* Specialties Section */}
            {isTech && (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Especialidades</label>
                <div className="flex flex-wrap gap-2">
                   {['Elétrica', 'Hidráulica', 'Mecânica', 'Pintura', 'Alvenaria', 'Climatização', 'Eletrônica', 'Engenharia'].map(tag => (
                     <button
                       key={tag}
                       type="button"
                       onClick={() => {
                         const current = formData.specialties || [];
                         const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
                         setFormData(prev => ({ ...prev, specialties: next }));
                       }}
                       className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                         formData.specialties?.includes(tag)
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                       }`}
                     >
                       {tag}
                     </button>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* Credibility Shelf Section */}
          {isTech && (
            <div className="py-4 border-t border-white/5 mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  📜 Estante da Credibilidade
                </h3>
                <p className="text-xs text-slate-500 mt-1">Suba fotos de seus certificados, diplomas ou cursos para gerar mais confiança nos clientes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {formData.certificates?.map((cert: string, idx: number) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 group">
                       <img src={cert} alt="Certificado" className="h-full w-full object-cover" />
                       <button
                          onClick={() => setFormData(prev => ({ ...prev, certificates: prev.certificates?.filter((_: string, i: number) => i !== idx) }))}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X size={12} />
                       </button>
                    </div>
                 ))}
              </div>

              <FileUpload
                onUpload={(urls) => setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), ...urls] }))}
                maxFiles={10}
                label="Adicionar Certificado (.jpg)"
              />
            </div>
          )}

          {/* Portfolio Section */}
          {isTech && (
            <div className="py-4 border-t border-white/5 mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    💼 Portfólio de Trabalhos (Antes & Depois)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Mostre o antes e depois de seus serviços para atrair novos clientes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPortfolioForm(!showPortfolioForm)}
                  className="flex items-center gap-1 text-xs font-bold bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-500 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> {showPortfolioForm ? 'Cancelar' : 'Adicionar Item'}
                </button>
              </div>

              {/* Form to Add Portfolio Item */}
              <AnimatePresence>
                {showPortfolioForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border border-white/10 rounded-2xl bg-white/[0.02] p-4 space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Título do Trabalho</label>
                      <input
                        className="w-full rounded-xl border border-white/5 bg-white/5 p-3 text-sm focus:border-cyan-500/50 outline-none"
                        placeholder="Ex: Instalação de Ar Condicionado Inverter"
                        value={portfolioTitle}
                        onChange={(e) => setPortfolioTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Descrição (Opcional)</label>
                      <textarea
                        className="w-full rounded-xl border border-white/5 bg-white/5 p-3 text-sm focus:border-cyan-500/50 outline-none"
                        placeholder="Descreva o serviço realizado, desafios resolvidos..."
                        rows={2}
                        value={portfolioDesc}
                        onChange={(e) => setPortfolioDesc(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Categoria (Opcional)</label>
                      <input
                        className="w-full rounded-xl border border-white/5 bg-white/5 p-3 text-sm focus:border-cyan-500/50 outline-none"
                        placeholder="Ex: Climatização"
                        value={portfolioCategory}
                        onChange={(e) => setPortfolioCategory(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Foto Antes</label>
                        {portfolioBefore ? (
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                            <img src={portfolioBefore} alt="Antes" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPortfolioBefore('')}
                              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <FileUpload
                            onUpload={(urls) => setPortfolioBefore(urls[0])}
                            maxFiles={1}
                            label="Upload Foto Antes"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Foto Depois</label>
                        {portfolioAfter ? (
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                            <img src={portfolioAfter} alt="Depois" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPortfolioAfter('')}
                              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <FileUpload
                            onUpload={(urls) => setPortfolioAfter(urls[0])}
                            maxFiles={1}
                            label="Upload Foto Depois"
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!portfolioTitle || !portfolioBefore || !portfolioAfter || createPortfolioMutation.isPending}
                      onClick={() => createPortfolioMutation.mutate({
                        title: portfolioTitle,
                        description: portfolioDesc || undefined,
                        category: portfolioCategory || undefined,
                        beforeUrl: portfolioBefore,
                        afterUrl: portfolioAfter
                      })}
                      className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {createPortfolioMutation.isPending ? 'Salvando...' : 'Salvar Item no Portfólio'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Portfolio List */}
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                {portfolioItems?.map((item) => (
                  <div key={item.id} className="relative border border-white/10 rounded-2xl bg-white/[0.01] overflow-hidden group animate-fade-in">
                    {/* Before/After comparison grid */}
                    <div className="grid grid-cols-2 gap-[1px] bg-white/10 aspect-[4/3] relative">
                      <div className="relative h-full w-full">
                        <img src={item.beforeUrl} alt="Antes" className="h-full w-full object-cover" />
                        <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/60 text-white rounded-md">Antes</span>
                      </div>
                      <div className="relative h-full w-full">
                        <img src={item.afterUrl} alt="Depois" className="h-full w-full object-cover" />
                        <span className="absolute bottom-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-cyan-600 text-white rounded-md">Depois</span>
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="p-3">
                      {item.category && (
                        <span className="text-[10px] font-extrabold text-cyan-500 uppercase tracking-widest">{item.category}</span>
                      )}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{item.title}</h4>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => deletePortfolioMutation.mutate(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {(!portfolioItems || portfolioItems.length === 0) && !showPortfolioForm && (
                  <div className="col-span-2 text-center py-6 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <Briefcase size={20} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Nenhum item adicionado ao seu portfólio ainda.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notificações Push PWA Widget */}
          <div className="glass-card bg-white/40 dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-cyan-600/10 flex items-center justify-center text-cyan-600">
                <Bell size={18} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações no Dispositivo</h3>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mantenha-se atualizado em tempo real</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-left">
              Ative as notificações push para receber alertas instantâneos de novos chamados, propostas aceitas e pagamentos em escrow diretamente no seu celular ou computador.
            </p>

            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={pushStatus === 'denied' || pushStatus === 'granted' || isSubscribing}
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                pushStatus === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : pushStatus === 'denied'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
              }`}
            >
              {isSubscribing ? (
                <>Ativando...</>
              ) : pushStatus === 'granted' ? (
                <>Notificações Ativas <CheckCircle size={14} /></>
              ) : pushStatus === 'denied' ? (
                <>Acesso Bloqueado pelo Navegador <X size={14} /></>
              ) : (
                <>Ativar Notificações Push <Bell size={14} /></>
              )}
            </button>
          </div>

          <button
            onClick={() => updateMutation.mutate(formData)}
            disabled={updateMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white transition-all hover:bg-cyan-500 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Salvando...' : (
              <>
                Salvar Alterações <Save size={18} />
              </>
            )}
          </button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium"
              >
                <CheckCircle size={16} /> Perfil atualizado com sucesso!
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
