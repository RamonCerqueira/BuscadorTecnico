'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api/client';
import { FileUpload } from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, MapPin, Phone, Briefcase, Save, CheckCircle, X,
  ShieldCheck, ShieldAlert, Clock, Camera, RefreshCw, Trash2, Plus, Bell,
  Eye, Lock, LayoutGrid, Settings, Award, Shield, Tag, HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '@/types/user';

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
      label: 'Pendência Documental',
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
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'portfolio' | 'services' | 'faq' | 'settings'>('personal');

  // Portfolio states
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState('');
  const [portfolioBefore, setPortfolioBefore] = useState('');
  const [portfolioAfter, setPortfolioAfter] = useState('');
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);

  // Services states
  const [serviceTitle, setServiceTitle] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  // FAQ states
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

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
        const vapidResponse = await apiGet<{ publicKey: string }>('/notifications/vapid-key');
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidResponse.publicKey),
        });
        await apiPost('/notifications/subscribe', subscription);
        alert('Notificações ativadas!');
      }
    } catch (err: any) {
      alert(`Falha ao assinar: ${err.message}`);
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
    mutationFn: async (data: Partial<UserProfile>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao salvar perfil');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      alert(error.message);
    }
  });

  const livenessMutation = useMutation({
    mutationFn: (selfieUrl: string) => apiPost('/users/upload-selfie', { selfieUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const kycMutation = useMutation({
    mutationFn: () => apiPost('/users/kyc/trigger', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const { data: portfolioItems } = useQuery({
    queryKey: ['portfolio', profile?.id],
    queryFn: () => apiGet<any[]>(`/portfolio/user/${profile?.id}`),
    enabled: !!profile?.id,
  });

  const createPortfolioMutation = useMutation({
    mutationFn: (data: any) => apiPost('/portfolio', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', profile?.id] });
      setPortfolioTitle(''); setPortfolioDesc(''); setPortfolioCategory(''); setPortfolioBefore(''); setPortfolioAfter('');
      setShowPortfolioForm(false);
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/portfolio/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio', profile?.id] })
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiPost('/users/me/services', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setServiceTitle(''); setServicePrice(''); setServiceDesc(''); }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/users/me/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  const createFaqMutation = useMutation({
    mutationFn: (data: any) => apiPost('/users/me/faqs', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setFaqQuestion(''); setFaqAnswer(''); }
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/users/me/faqs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  });

  const isTech = formData.userType === 'technician' || formData.userType === 'company';
  const isCompany = formData.userType === 'company';

  const TABS = [
    { id: 'personal', label: 'Dados Pessoais', icon: <User size={16} /> },
    ...(isTech ? [
      { id: 'services', label: 'Catálogo', icon: <Tag size={16} /> },
      { id: 'portfolio', label: 'Portfólio', icon: <LayoutGrid size={16} /> },
      { id: 'faq', label: 'Dúvidas', icon: <HelpCircle size={16} /> },
      { id: 'security', label: 'Segurança', icon: <Shield size={16} /> }
    ] : []),
    { id: 'settings', label: 'Ajustes', icon: <Settings size={16} /> },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
            Meu Perfil
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Gerencie suas informações, segurança e portfólio.
          </p>
        </div>
        
        {profile?.id && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0 border-none disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Salvando...' : <><Save size={16} /> Salvar Perfil</>}
            </button>
            <Link 
              href={`/profile/${profile.slug || profile.id}`} 
              target="_blank"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 shrink-0"
            >
              <Eye size={16} /> Ver Vitrine
            </Link>
          </div>
        )}
      </header>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl"
          >
            <CheckCircle size={20} />
            Perfil atualizado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-center md:justify-start gap-x-3 sm:gap-x-6 mb-8 border-b border-slate-200 dark:border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 -mb-[1px] ${
              activeTab === tab.id 
                ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500' 
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {/* TAB: DADOS PESSOAIS */}
          {activeTab === 'personal' && (
            <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 group cursor-pointer">
                  <div className={`h-full w-full overflow-hidden border-4 border-white dark:border-[#111119] shadow-2xl bg-slate-100 dark:bg-[#0c0d12] flex items-center justify-center transition-all ${isCompany ? 'rounded-2xl' : 'rounded-full'}`}>
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover group-hover:brightness-50 transition-all" />
                    ) : (
                      <User size={48} className="text-slate-300 group-hover:opacity-50 transition-opacity" />
                    )}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Alterar</span>
                  </div>

                  {/* Hidden File Upload */}
                  <div className="absolute inset-0 z-20 opacity-0 cursor-pointer overflow-hidden [&>div]:h-full [&>div]:p-0 [&>div]:border-none [&>div]:bg-transparent">
                    <FileUpload maxFiles={1} onUpload={(urls) => setFormData(prev => ({ ...prev, avatarUrl: urls[0] }))} label="" />
                  </div>
                </div>
                
                <div className="flex-1 w-full text-center sm:text-left space-y-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Foto do Perfil</h2>
                  <p className="text-xs text-slate-500 pb-2">Clique na imagem ao lado para alterar a sua foto de exibição. Recomendamos imagens 500x500px.</p>
                  {isTech && <KycBadge status={formData.kycStatus} livenessVerified={formData.livenessVerified} />}
                </div>
              </section>

              {isTech && (
                <section className="glass-card p-6 sm:p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                    <div className="flex-1 w-full text-center sm:text-left space-y-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">Capa do Perfil</h2>
                      <p className="text-xs text-slate-500 pb-2">Esta imagem aparecerá no topo do seu perfil público. Recomendamos imagens retangulares (ex: 1200x400px).</p>
                    </div>
                  </div>
                  <div className="relative h-32 sm:h-48 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0c0d12] border-4 border-slate-200 dark:border-white/10 shadow-inner group cursor-pointer flex items-center justify-center">
                    {formData.coverUrl ? (
                      <img src={formData.coverUrl} alt="Cover" className="h-full w-full object-cover group-hover:brightness-50 transition-all" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-2 group-hover:opacity-50 transition-opacity">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">Adicionar Capa</span>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <Camera size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Alterar Capa</span>
                    </div>

                    {/* Hidden File Upload */}
                    <div className="absolute inset-0 z-20 opacity-0 cursor-pointer overflow-hidden [&>div]:h-full [&>div]:p-0 [&>div]:border-none [&>div]:bg-transparent">
                      <FileUpload maxFiles={1} onUpload={(urls) => setFormData(prev => ({ ...prev, coverUrl: urls[0] }))} label="" />
                    </div>
                  </div>
                </section>
              )}

              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <User size={16} className="text-cyan-500" /> Informações Básicas
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nome de Exibição</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {isTech && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Link Personalizado (Opcional)</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
                      <span className="flex items-center px-4 bg-slate-100 dark:bg-white/5 text-slate-500 font-bold text-xs select-none">
                        techfix.com/profile/
                      </span>
                      <input
                        className="flex-1 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium outline-none placeholder-slate-300 dark:placeholder-slate-700 lowercase"
                        placeholder="seu-nome-aqui"
                        value={formData.slug || ''}
                        onChange={(e) => {
                          // Allow only lowercase letters, numbers, and dashes
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setFormData(prev => ({ ...prev, slug: value }));
                        }}
                      />
                    </div>
                  </div>
                )}

                {isCompany && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Razão Social</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium outline-none"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">CNPJ</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium outline-none"
                        value={formData.cnpj || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Telefone / WhatsApp</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cidade - UF</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                      placeholder="Ex: São Paulo - SP"
                      value={formData.city ? `${formData.city} - ${formData.state || ''}` : ''}
                      onChange={(e) => {
                        const [city, state] = e.target.value.split('-').map(s => s.trim());
                        setFormData(prev => ({ ...prev, city, state }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sua Biografia Profissional</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 p-4 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                    placeholder="Conte aos clientes sobre sua experiência, diferenciais e forma de trabalho..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                {isTech && (
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Especialidades (Tags)</label>
                    <div className="flex flex-wrap gap-2">
                       {['Ar Condicionado', 'Elétrica', 'Hidráulica', 'Mecânica', 'Pintura', 'Alvenaria', 'CFTV', 'Engenharia', 'Limpeza', 'Frete'].map(tag => (
                         <button
                           key={tag}
                           type="button"
                           onClick={() => {
                             const current = formData.specialties || [];
                             const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
                             setFormData(prev => ({ ...prev, specialties: next }));
                           }}
                           className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                             formData.specialties?.includes(tag)
                              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                           }`}
                         >
                           {tag}
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* TAB: SECURITY & CREDENTIALS */}
          {activeTab === 'security' && isTech && (
            <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Verificação de Identidade</h3>
                    <p className="text-sm text-slate-500 mt-1">Aumente sua credibilidade comprovando quem você é com nossa IA anti-fraude.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-white/5">
                  {/* Selfie Box */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Prova de Vida (Selfie Liveness)</h4>
                    
                    {formData.selfieUrl ? (
                      <div className="relative h-40 w-full rounded-2xl overflow-hidden border-2 border-emerald-500/30">
                        <img src={formData.selfieUrl} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent flex items-end p-4">
                          <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1"><CheckCircle size={14}/> Verificado</span>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <Camera size={32} className="text-blue-500 mb-2" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Tirar Selfie pelo Celular</span>
                        <input
                          type="file" accept="image/*" capture="user" className="sr-only"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData(); fd.append('file', file); fd.append('folder', 'selfies');
                            try {
                              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/file`, {
                                method: 'POST',
                                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}` },
                                body: fd
                              });
                              if (!res.ok) throw new Error('Upload falhou');
                              const data = await res.json();
                              livenessMutation.mutate(data.url);
                            } catch (error) { console.error(error); }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* KYC Box */}
                  <div className="space-y-4 flex flex-col">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Antecedentes (KYC)</h4>
                    <div className="flex-1 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between">
                      <div>
                        <KycBadge status={formData.kycStatus} />
                        {formData.kycDetails && (
                          <p className="text-xs text-slate-500 mt-3 bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                            {formData.kycDetails}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => kycMutation.mutate()}
                        disabled={kycMutation.isPending}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                      >
                        <RefreshCw size={14} className={kycMutation.isPending ? 'animate-spin' : ''} />
                        Solicitar Nova Checagem
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Certificados */}
              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Award size={20} className="text-amber-500" /> Estante de Certificados
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Faça upload dos seus diplomas e cursos para o cliente ver.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.certificates?.map((cert: string, idx: number) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 group">
                        <img src={cert} alt="Cert" className="h-full w-full object-cover" />
                        <button onClick={() => setFormData(prev => ({ ...prev, certificates: prev.certificates?.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600 scale-90 hover:scale-100">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-[4/3] w-full">
                      <FileUpload onUpload={(urls) => setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), ...urls] }))} maxFiles={5} label="Adicionar (.jpg/.png)" />
                    </div>
                 </div>
              </section>
            </motion.div>
          )}

          {/* TAB: PORTFOLIO */}
          {activeTab === 'portfolio' && isTech && (
            <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <LayoutGrid size={20} className="text-cyan-500" /> Seu Portfólio de Obras
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Exiba fotos do "Antes e Depois" dos serviços maravilhosos que você fez.</p>
                  </div>
                  <button onClick={() => setShowPortfolioForm(!showPortfolioForm)} className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-cyan-500/20">
                    <Plus size={16} /> Adicionar Novo
                  </button>
                </div>

                <AnimatePresence>
                  {showPortfolioForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 space-y-4 mt-2">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Título do Serviço</label>
                          <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" placeholder="Ex: Reforma elétrica em galpão" value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Breve Descrição</label>
                          <textarea className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" rows={2} value={portfolioDesc} onChange={e => setPortfolioDesc(e.target.value)} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Foto ANTES</label>
                            {portfolioBefore ? (
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10"><img src={portfolioBefore} className="h-full w-full object-cover" /><button onClick={() => setPortfolioBefore('')} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white"><X size={14}/></button></div>
                            ) : <FileUpload onUpload={urls => setPortfolioBefore(urls[0])} maxFiles={1} label="Upload do Antes" />}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Foto DEPOIS</label>
                            {portfolioAfter ? (
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10"><img src={portfolioAfter} className="h-full w-full object-cover" /><button onClick={() => setPortfolioAfter('')} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white"><X size={14}/></button></div>
                            ) : <FileUpload onUpload={urls => setPortfolioAfter(urls[0])} maxFiles={1} label="Upload do Depois" />}
                          </div>
                        </div>
                        <div className="pt-2">
                           <button disabled={!portfolioTitle || !portfolioBefore || !portfolioAfter || createPortfolioMutation.isPending} onClick={() => createPortfolioMutation.mutate({ title: portfolioTitle, description: portfolioDesc, beforeUrl: portfolioBefore, afterUrl: portfolioAfter })} className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs transition-all disabled:opacity-50">
                             {createPortfolioMutation.isPending ? 'Salvando...' : 'Publicar no Portfólio'}
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {portfolioItems?.map((item) => (
                    <div key={item.id} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 shadow-sm">
                      <div className="grid grid-cols-2 gap-[2px] bg-slate-200 dark:bg-white/10 aspect-[4/3] relative">
                        <div className="relative"><img src={item.beforeUrl} className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 text-[9px] font-black uppercase bg-black/60 text-white px-2 py-0.5 rounded">Antes</span></div>
                        <div className="relative"><img src={item.afterUrl} className="h-full w-full object-cover" /><span className="absolute bottom-2 right-2 text-[9px] font-black uppercase bg-cyan-600 text-white px-2 py-0.5 rounded shadow">Depois</span></div>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{item.title}</h4>
                      </div>
                      <button onClick={() => deletePortfolioMutation.mutate(item.id)} className="absolute top-2 right-2 h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {portfolioItems?.length === 0 && !showPortfolioForm && (
                     <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl opacity-60">
                       <LayoutGrid size={32} className="mx-auto mb-3" />
                       <p className="text-sm font-bold">Nenhum trabalho adicionado</p>
                     </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && isTech && (
            <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag size={20} className="text-emerald-500" /> Tabela de Preços e Serviços
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Crie um menu prático para seus clientes já saberem o valor do seu serviço.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nome do Serviço</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" placeholder="Ex: Limpeza de Ar 9000 BTUs" value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preço (Opcional)</label>
                      <input type="number" className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" placeholder="150" value={servicePrice} onChange={e => setServicePrice(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Descrição Curta</label>
                    <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" placeholder="Ex: Inclui higienização e troca de gás" value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} />
                  </div>
                  <div className="pt-2">
                    <button disabled={!serviceTitle || createServiceMutation.isPending} onClick={() => createServiceMutation.mutate({ title: serviceTitle, description: serviceDesc, price: servicePrice ? Number(servicePrice) : null })} className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs transition-all disabled:opacity-50">
                      {createServiceMutation.isPending ? 'Adicionando...' : 'Adicionar ao Catálogo'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {formData.services?.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119]">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{svc.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{svc.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {svc.price && <span className="font-black text-emerald-600 dark:text-emerald-400">R$ {Number(svc.price).toFixed(2)}</span>}
                        <button onClick={() => deleteServiceMutation.mutate(svc.id)} className="h-8 w-8 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {(!formData.services || formData.services.length === 0) && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl opacity-60">
                      <p className="text-sm font-bold">Nenhum serviço cadastrado.</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && isTech && (
            <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle size={20} className="text-amber-500" /> Dúvidas Frequentes (FAQ)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Responda as perguntas mais comuns dos seus clientes de forma automatizada.</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pergunta do Cliente</label>
                    <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" placeholder="Ex: Vocês oferecem garantia do serviço?" value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sua Resposta</label>
                    <textarea className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] p-4 text-sm font-medium outline-none" rows={2} placeholder="Sim, oferecemos 90 dias de garantia..." value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} />
                  </div>
                  <div className="pt-2">
                    <button disabled={!faqQuestion || !faqAnswer || createFaqMutation.isPending} onClick={() => createFaqMutation.mutate({ question: faqQuestion, answer: faqAnswer })} className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs transition-all disabled:opacity-50">
                      {createFaqMutation.isPending ? 'Adicionando...' : 'Adicionar Pergunta'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  {formData.faqs?.map((faq) => (
                    <div key={faq.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111119] relative group">
                      <button onClick={() => deleteFaqMutation.mutate(faq.id)} className="absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                      <h4 className="font-bold text-slate-900 dark:text-white pr-8">Q: {faq.question}</h4>
                      <p className="text-sm text-slate-500 mt-1">R: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <section className="glass-card p-8 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-black/5 space-y-4">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <Bell size={24} className="text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Notificações em Tempo Real</h3>
                      <p className="text-sm text-slate-500">Receba alertas de chamados e orçamentos direto no celular ou PC.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEnableNotifications}
                    disabled={pushStatus === 'granted' || isSubscribing}
                    className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      pushStatus === 'granted' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                    }`}
                  >
                    {isSubscribing ? 'Ativando...' : pushStatus === 'granted' ? 'Ativo e Funcionando ✅' : 'Ativar Notificações Push'}
                  </button>
               </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Save Action */}
        {(activeTab === 'personal' || activeTab === 'security') && (
          <div className="sticky bottom-4 z-50 mt-8 pt-4">
            <button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 text-sm font-black transition-all hover:scale-[1.02] shadow-2xl shadow-black/20 dark:shadow-white/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Salvando...' : <><Save size={18} /> Salvar Alterações do Perfil</>}
            </button>
            
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <CheckCircle size={14} /> Salvo com Sucesso!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
