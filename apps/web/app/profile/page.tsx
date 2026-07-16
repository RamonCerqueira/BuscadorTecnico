'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete, apiPatch } from '@/lib/api/client';
import { FileUpload } from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, MapPin, Phone, Briefcase, Save, CheckCircle, X,
  ShieldCheck, ShieldAlert, Clock, Camera, RefreshCw, Trash2, Plus, Bell,
  Eye, Lock, LayoutGrid, Settings, Award, Shield, Tag, HelpCircle,
  Image as ImageIcon, CreditCard, Building2, FileText, Landmark, Users,
  BarChart3, Star, Wallet, Compass, CheckCircle2, ChevronRight, Check
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
    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
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
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  // Client Address states
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Bank states
  const [bankName, setBankName] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountType, setBankAccountType] = useState('corrente');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [pixKey, setPixKey] = useState('');
  const [payouts, setPayouts] = useState<any[]>([]);

  // Team states
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberStatus, setMemberStatus] = useState('active');

  // Admin settings
  const [commissionRate, setCommissionRate] = useState('12');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<UserProfile>('/users/me')
  });

  // Sync profile data and local persistence
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      
      // Load addresses
      const localAddrs = localStorage.getItem(`addresses_${profile.id}`);
      if (localAddrs) setSavedAddresses(JSON.parse(localAddrs));

      // Load bank details
      const localBank = localStorage.getItem(`bank_${profile.id}`);
      if (localBank) {
        const p = JSON.parse(localBank);
        setBankName(p.bankName || '');
        setBankAgency(p.bankAgency || '');
        setBankAccount(p.bankAccount || '');
        setBankAccountType(p.bankAccountType || 'corrente');
        setPixKeyType(p.pixKeyType || 'cpf');
        setPixKey(p.pixKey || '');
      }

      // Load simulated payouts
      const localPayouts = localStorage.getItem(`payouts_${profile.id}`);
      if (localPayouts) {
        setPayouts(JSON.parse(localPayouts));
      } else {
        const dummyPayouts = [
          { id: '1', date: '2026-07-10', amount: 350.00, status: 'completed', type: 'Pix' },
          { id: '2', date: '2026-06-25', amount: 1200.00, status: 'completed', type: 'TED' },
          { id: '3', date: '2026-07-15', amount: 450.00, status: 'processing', type: 'Pix' }
        ];
        localStorage.setItem(`payouts_${profile.id}`, JSON.stringify(dummyPayouts));
        setPayouts(dummyPayouts);
      }

      // Load team members
      const localTeam = localStorage.getItem(`team_${profile.id}`);
      if (localTeam) {
        setTeamMembers(JSON.parse(localTeam));
      } else {
        const dummyTeam = [
          { id: '1', name: 'Carlos Santos', role: 'Eletricista Assistente', phone: '(11) 98888-7777', status: 'active' },
          { id: '2', name: 'Juliana Lima', role: 'Apoio de Climatização', phone: '(11) 97777-6666', status: 'active' }
        ];
        localStorage.setItem(`team_${profile.id}`, JSON.stringify(dummyTeam));
        setTeamMembers(dummyTeam);
      }
    }
  }, [profile]);

  // Load preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'dark';
      setTheme(storedTheme as any);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const commission = localStorage.getItem('admin_commission') || '12';
      setCommissionRate(commission);

      const maint = localStorage.getItem('admin_maintenance') === 'true';
      setMaintenanceMode(maint);

      if ('Notification' in window) {
        setPushStatus(Notification.permission);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
      alert(`Falha ao assinar notificações: ${err.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      // API call to update profile fields
      return apiPatch<UserProfile>('/users/me', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error: any) => {
      alert(error.message || 'Erro ao salvar perfil');
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

  // Client Address functions
  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setIsSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setEstado(data.uf || '');
      } else {
        alert('CEP não encontrado');
      }
    } catch {
      alert('Erro ao buscar CEP');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleAddAddress = () => {
    if (!logradouro || !numero || !cidade || !estado) {
      alert('Preencha os campos obrigatórios do endereço.');
      return;
    }
    const newAddr = {
      id: Math.random().toString(),
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado
    };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    if (profile?.id) {
      localStorage.setItem(`addresses_${profile.id}`, JSON.stringify(updated));
    }
    // Clean fields
    setCep(''); setLogradouro(''); setNumero(''); setComplemento(''); setBairro(''); setCidade(''); setEstado('');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (profile?.id) {
      localStorage.setItem(`addresses_${profile.id}`, JSON.stringify(updated));
    }
  };

  // Bank Info function
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    const details = { bankName, bankAgency, bankAccount, bankAccountType, pixKeyType, pixKey };
    localStorage.setItem(`bank_${profile.id}`, JSON.stringify(details));
    alert('Dados bancários salvos com sucesso!');
  };

  // Team functions
  const handleAddTeamMember = () => {
    if (!memberName || !memberRole) {
      alert('Nome e cargo são obrigatórios.');
      return;
    }
    const newMember = {
      id: Math.random().toString(),
      name: memberName,
      role: memberRole,
      phone: memberPhone,
      status: memberStatus
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    if (profile?.id) {
      localStorage.setItem(`team_${profile.id}`, JSON.stringify(updated));
    }
    setMemberName(''); setMemberRole(''); setMemberPhone('');
  };

  const handleDeleteTeamMember = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    setTeamMembers(updated);
    if (profile?.id) {
      localStorage.setItem(`team_${profile.id}`, JSON.stringify(updated));
    }
  };

  const handleToggleTeamStatus = (id: string) => {
    const updated = teamMembers.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m);
    setTeamMembers(updated);
    if (profile?.id) {
      localStorage.setItem(`team_${profile.id}`, JSON.stringify(updated));
    }
  };

  // Admin settings save
  const handleSaveAdminSettings = () => {
    localStorage.setItem('admin_commission', commissionRate);
    localStorage.setItem('admin_maintenance', String(maintenanceMode));
    alert('Configurações do sistema aplicadas!');
    if (broadcastMessage) {
      alert(`Mensagem global transmitida com sucesso: "${broadcastMessage}"`);
      setBroadcastMessage('');
    }
  };

  const userType = formData.userType || 'client';
  const isTech = userType === 'technician' || userType === 'company';
  const isCompany = userType === 'company';
  const isAdmin = userType === 'admin';
  const isClient = userType === 'client';

  // Dynamic Tabs config based on role
  const TABS = [
    { id: 'personal', label: 'Dados Pessoais', icon: <User size={16} /> },
    ...(isClient ? [
      { id: 'addresses', label: 'Endereços', icon: <MapPin size={16} /> },
      { id: 'history', label: 'Histórico & Favoritos', icon: <Compass size={16} /> },
    ] : []),
    ...(isTech ? [
      { id: 'services', label: 'Catálogo', icon: <Tag size={16} /> },
      { id: 'portfolio', label: 'Portfólio', icon: <LayoutGrid size={16} /> },
      { id: 'faq', label: 'FAQ Técnico', icon: <HelpCircle size={16} /> },
      { id: 'security', label: 'Segurança & Selos', icon: <Shield size={16} /> },
      { id: 'financial', label: 'Financeiro', icon: <Wallet size={16} /> },
    ] : []),
    ...(isCompany ? [
      { id: 'team', label: 'Nossa Equipe', icon: <Users size={16} /> }
    ] : []),
    ...(isAdmin ? [
      { id: 'admin-panel', label: 'Administrador', icon: <BarChart3 size={16} /> }
    ] : []),
    { id: 'settings', label: 'Ajustes', icon: <Settings size={16} /> }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        
        {/* UPPER STATUS BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-205 dark:border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Sessão Ativa • Portal do {
                userType === 'client' ? 'Cliente' :
                userType === 'technician' ? 'Técnico Autônomo' :
                userType === 'company' ? 'Empresa Assistência' : 'Administrador Geral'
              }
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all border-none disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Salvando...' : <><Save size={14} /> Salvar Perfil</>}
            </button>

            {isTech && profile?.id && (
              <Link
                href={`/profile/${profile.slug || profile.id}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Eye size={14} /> Ver Vitrine
              </Link>
            )}
          </div>
        </div>

        {/* PROFILE COVER & MAIN INFO */}
        <section className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 shadow-xl mb-8">
          
          {/* Capa */}
          <div className="relative h-40 sm:h-56 w-full bg-gradient-to-r from-slate-900 via-zinc-800 to-zinc-955 flex items-center justify-center group overflow-hidden">
            {formData.coverUrl ? (
              <img src={formData.coverUrl} alt="Cover" className="h-full w-full object-cover group-hover:brightness-50 transition-all duration-300" />
            ) : (
              <div className="text-zinc-500 flex flex-col items-center gap-1 group-hover:opacity-60 transition-opacity">
                <ImageIcon size={32} />
                <span className="text-[10px] font-black uppercase tracking-wider">Adicionar Capa do Perfil</span>
              </div>
            )}
            
            {/* Hover capa */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
              <Camera size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Alterar Imagem de Capa</span>
            </div>
            
            <div className="absolute inset-0 z-20 opacity-0 cursor-pointer overflow-hidden [&>div]:h-full [&>div]:p-0 [&>div]:border-none [&>div]:bg-transparent">
              <FileUpload maxFiles={1} onUpload={(urls) => setFormData(prev => ({ ...prev, coverUrl: urls[0] }))} label="" />
            </div>
          </div>

          {/* Avatar e Informações Centrais */}
          <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 relative z-30">
            
            {/* Avatar container */}
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 shrink-0 group cursor-pointer">
              <div className={`h-full w-full overflow-hidden border-4 border-white dark:border-[#0c0c0e] shadow-2xl bg-zinc-100 dark:bg-[#121217] flex items-center justify-center transition-all ${isCompany ? 'rounded-2xl' : 'rounded-full'}`}>
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover group-hover:brightness-50 transition-all duration-300" />
                ) : (
                  <User size={48} className="text-zinc-400 group-hover:opacity-65 transition-opacity" />
                )}
              </div>
              
              {/* Hover avatar */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <Camera size={22} />
                <span className="text-[9px] font-black uppercase tracking-wider mt-1">Alterar Foto</span>
              </div>

              {/* Upload Oculto */}
              <div className="absolute inset-0 z-20 opacity-0 cursor-pointer overflow-hidden [&>div]:h-full [&>div]:p-0 [&>div]:border-none [&>div]:bg-transparent">
                <FileUpload maxFiles={1} onUpload={(urls) => setFormData(prev => ({ ...prev, avatarUrl: urls[0] }))} label="" />
              </div>
            </div>

            {/* Info Basica no Header */}
            <div className="flex-1 text-center sm:text-left pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {formData.name || 'Nome do Usuário'}
                </h2>
                <span className="inline-flex self-center items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  {userType === 'client' ? 'Cliente' : userType === 'technician' ? 'Técnico' : userType === 'company' ? 'Empresa' : 'Admin'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
                {formData.city ? `${formData.city} - ${formData.state || ''}` : 'Sem endereço configurado'} • {formData.email}
              </p>

              {isTech && (
                <KycBadge status={formData.kycStatus} livenessVerified={formData.livenessVerified} />
              )}
            </div>
          </div>
        </section>

        {/* SUCCESS NOTIFICATION */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-2xl"
            >
              <CheckCircle2 size={18} />
              <span>Perfil atualizado com sucesso!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ADAPTIVE NAVIGATION TABS */}
        <div className="flex items-center justify-start gap-x-2 sm:gap-x-4 mb-8 border-b border-slate-200 dark:border-white/5 overflow-x-auto overflow-y-hidden no-scrollbar py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 -mb-[10px] ${
                activeTab === tab.id
                  ? 'text-indigo-500 dark:text-indigo-400 border-indigo-500'
                  : 'text-slate-500 dark:text-zinc-400 border-transparent hover:text-slate-800 dark:hover:text-zinc-200 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TABS CONTAINER */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            
            {/* TAB: DADOS PESSOAIS */}
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Informações de Perfil */}
                  <div className="md:col-span-2 bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <User size={16} className="text-indigo-500" /> Identificação Básica
                    </h3>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome de Exibição</label>
                        <input
                          className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          value={formData.name || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Telefone / WhatsApp</label>
                        <input
                          className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="(11) 99999-9999"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cidade</label>
                        <input
                          className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          value={formData.city || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Estado (UF)</label>
                        <input
                          className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="EX: SP"
                          maxLength={2}
                          value={formData.state || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                        />
                      </div>
                    </div>

                    {isTech && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Link Personalizado (Slug Público)</label>
                        <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                          <span className="flex items-center px-4 bg-slate-100 dark:bg-white/5 text-zinc-400 font-bold text-[11px] select-none">
                            buscador.com/profile/
                          </span>
                          <input
                            className="flex-1 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold outline-none placeholder-zinc-600 lowercase"
                            placeholder="seu-nome-slug"
                            value={formData.slug || ''}
                            onChange={(e) => {
                              const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                              setFormData(prev => ({ ...prev, slug: value }));
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Biografia Profissional / Apresentação</label>
                      <textarea
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-4 text-xs font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                        placeholder="Escreva um resumo de sua experiência..."
                        value={formData.bio || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Sidebar Legal / Dados de Contato fixo */}
                  <div className="space-y-6">
                    
                    {/* Exclusivo para Empresas (company) */}
                    {isCompany && (
                      <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                          <Building2 size={16} className="text-indigo-500" /> Registro Corporativo
                        </h3>
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Razão Social</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-3.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                            value={formData.companyName || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">CNPJ</label>
                          <input
                            className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 p-3.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                            placeholder="00.000.000/0001-00"
                            value={formData.cnpj || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Informações de Acesso</h3>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">E-mail Cadastrado</span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg truncate">
                          {formData.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Identificador Único</span>
                        <p className="text-[10px] font-mono text-zinc-550 select-all truncate bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg">
                          {formData.id}
                        </p>
                      </div>
                    </div>

                    {isTech && (
                      <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Especialidades Ativas</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Ar Condicionado', 'Elétrica', 'Hidráulica', 'Pintura', 'Alvenaria', 'CFTV', 'Engenharia', 'Limpeza', 'Frete'].map(tag => {
                            const current = formData.specialties || [];
                            const active = current.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  const next = active ? current.filter(t => t !== tag) : [...current, tag];
                                  setFormData(prev => ({ ...prev, specialties: next }));
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                  active
                                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: ADDRESSES (Client Only) */}
            {activeTab === 'addresses' && isClient && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Adicionar endereço */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Plus size={16} className="text-indigo-500" /> Adicionar Endereço
                    </h3>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">CEP</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="00000-000"
                          className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={searchCep}
                          disabled={isSearchingCep}
                          className="h-10 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 active:scale-95 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-black uppercase transition-all disabled:opacity-50"
                        >
                          {isSearchingCep ? '...' : 'Buscar'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Logradouro / Rua</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                        value={logradouro}
                        onChange={(e) => setLogradouro(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Número</label>
                        <input
                          className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="Ex: 123"
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Complemento</label>
                        <input
                          className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="Apto, Bloco"
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Bairro</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cidade</label>
                        <input
                          className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Estado (UF)</label>
                        <input
                          className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500"
                          maxLength={2}
                          value={estado}
                          onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs transition-all shadow-lg active:scale-[0.98]"
                    >
                      Salvar Endereço
                    </button>
                  </div>

                  {/* Lista de Endereços */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Meus Endereços Cadastrados</h3>
                    
                    <div className="grid gap-4">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                              <MapPin size={18} className="text-indigo-500" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-black text-slate-900 dark:text-white">
                                {addr.logradouro}, {addr.numero} {addr.complemento && ` - ${addr.complemento}`}
                              </p>
                              <p className="text-[11px] text-zinc-500 font-semibold">
                                {addr.bairro} • {addr.cidade} - {addr.estado} • CEP {addr.cep}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="h-9 w-9 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}

                      {savedAddresses.length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl opacity-60">
                          <MapPin className="mx-auto mb-3 text-zinc-500" size={32} />
                          <p className="text-xs font-black">Nenhum endereço salvo.</p>
                          <p className="text-[10px] text-zinc-500 mt-1">Insira os dados à esquerda para adicionar seu primeiro endereço.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: HISTORY (Client Only) */}
            {activeTab === 'history' && isClient && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Chamados Abertos</span>
                    <p className="text-2xl font-black mt-2 text-indigo-500">4</p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Serviços Concluídos</span>
                    <p className="text-2xl font-black mt-2 text-emerald-500">12</p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Plano de Assinatura</span>
                    <p className="text-base font-black mt-3 text-cyan-500 flex items-center gap-1">
                      {formData.subscriptionActive ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Assinatura Ativa
                        </>
                      ) : (
                        <>
                          <X size={14} className="text-rose-500 shrink-0" /> Sem Assinatura
                        </>
                      )}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Avaliações Dadas</span>
                    <p className="text-2xl font-black mt-2 text-amber-500">10</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Fav lists */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Meus Técnicos Favoritos</h3>
                    
                    <div className="grid gap-4">
                      {[
                        { id: 'fav1', name: 'Rodrigo Eletricidade', rating: 4.9, reviews: 45, specialty: 'Eletrodomésticos & Fiação' },
                        { id: 'fav2', name: 'Manoel Encanador', rating: 4.8, reviews: 29, specialty: 'Hidráulica & Vazamentos' }
                      ].map((tech) => (
                        <div key={tech.id} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500">
                              {tech.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">{tech.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-semibold">{tech.specialty}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Star size={11} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600">{tech.rating}</span>
                                <span className="text-[9px] text-zinc-500 font-medium">({tech.reviews} avaliações)</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/profile/${tech.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-500 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Perfil <ChevronRight size={10} />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificado de qualidade do cliente */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Award size={16} className="text-amber-500" /> Selo de Bom Cliente
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                      Com base nas avaliações dos técnicos parceiros, você possui uma média de <strong>5.0 Estrelas</strong> como contratante.
                    </p>
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
                      <Star size={14} className="fill-current" /> CLIENTE ESTRELA PLATINA
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: SERVICES (Tech & Company Only) */}
            {activeTab === 'services' && isTech && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag size={18} className="text-emerald-500" /> Tabela de Preços e Catálogo
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Cadastre os valores e descrições dos seus principais serviços para visualização do cliente.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome do Serviço</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Higienização de Ar Condicionado Split" value={serviceTitle} onChange={e => setServiceTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Preço (R$)</label>
                        <input type="number" className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="150" value={servicePrice} onChange={e => setServicePrice(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Descrição Curta</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Higienização profunda, lavagem dos filtros e aplicação de bactericida" value={serviceDesc} onChange={e => setServiceDesc(e.target.value)} />
                    </div>
                    <button disabled={!serviceTitle || createServiceMutation.isPending} onClick={() => createServiceMutation.mutate({ title: serviceTitle, description: serviceDesc, price: servicePrice ? Number(servicePrice) : null })} className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs transition-all shadow-md active:scale-95 disabled:opacity-50">
                      {createServiceMutation.isPending ? 'Adicionando...' : 'Adicionar ao Catálogo'}
                    </button>
                  </div>

                  <div className="space-y-3 mt-6">
                    {formData.services?.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black/20">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{svc.title}</h4>
                          <p className="text-[11px] text-zinc-550 font-semibold">{svc.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {svc.price && <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">R$ {Number(svc.price).toFixed(2)}</span>}
                          <button onClick={() => deleteServiceMutation.mutate(svc.id)} className="h-8 w-8 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shrink-0"><Trash2 size={13}/></button>
                        </div>
                      </div>
                    ))}
                    {(!formData.services || formData.services.length === 0) && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl opacity-60">
                        <p className="text-xs font-black">Nenhum serviço cadastrado.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PORTFOLIO (Tech & Company Only) */}
            {activeTab === 'portfolio' && isTech && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid size={18} className="text-indigo-500" /> Portfólio ("Antes e Depois")
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">Adicione fotos comparativas dos seus melhores trabalhos para comprovar suas habilidades técnicas.</p>
                    </div>
                    <button onClick={() => setShowPortfolioForm(!showPortfolioForm)} className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-md">
                      <Plus size={14} /> Novo Trabalho
                    </button>
                  </div>

                  <AnimatePresence>
                    {showPortfolioForm && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Título do Trabalho</label>
                            <input className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none" placeholder="Ex: Instalação de Quadros de Distribuição" value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Descrição Curta</label>
                            <textarea className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none resize-none" rows={2} placeholder="Descreva os materiais usados e o desafio do serviço..." value={portfolioDesc} onChange={e => setPortfolioDesc(e.target.value)} />
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Foto ANTES</label>
                              {portfolioBefore ? (
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800"><img src={portfolioBefore} className="h-full w-full object-cover" /><button onClick={() => setPortfolioBefore('')} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white"><X size={12}/></button></div>
                              ) : <FileUpload onUpload={urls => setPortfolioBefore(urls[0])} maxFiles={1} label="Upload Foto Antes" />}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Foto DEPOIS</label>
                              {portfolioAfter ? (
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800"><img src={portfolioAfter} className="h-full w-full object-cover" /><button onClick={() => setPortfolioAfter('')} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white"><X size={12}/></button></div>
                              ) : <FileUpload onUpload={urls => setPortfolioAfter(urls[0])} maxFiles={1} label="Upload Foto Depois" />}
                            </div>
                          </div>
                          <button disabled={!portfolioTitle || !portfolioBefore || !portfolioAfter || createPortfolioMutation.isPending} onClick={() => createPortfolioMutation.mutate({ title: portfolioTitle, description: portfolioDesc, beforeUrl: portfolioBefore, afterUrl: portfolioAfter })} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs transition-all disabled:opacity-50">
                            {createPortfolioMutation.isPending ? 'Salvando...' : 'Publicar no Portfólio'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    {portfolioItems?.map((item) => (
                      <div key={item.id} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 group bg-slate-50 dark:bg-black/20">
                        <div className="grid grid-cols-2 gap-[2px] bg-slate-200 dark:bg-[#111119] aspect-[4/3] relative">
                          <div className="relative"><img src={item.beforeUrl} className="h-full w-full object-cover" /><span className="absolute bottom-2 left-2 text-[9px] font-black uppercase bg-black/75 text-white px-2 py-0.5 rounded">Antes</span></div>
                          <div className="relative"><img src={item.afterUrl} className="h-full w-full object-cover" /><span className="absolute bottom-2 right-2 text-[9px] font-black uppercase bg-cyan-600 text-white px-2 py-0.5 rounded">Depois</span></div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <button onClick={() => deletePortfolioMutation.mutate(item.id)} className="absolute top-2 right-2 h-8 w-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-rose-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {portfolioItems?.length === 0 && !showPortfolioForm && (
                      <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl opacity-60">
                        <LayoutGrid size={32} className="mx-auto mb-3 text-zinc-500" />
                        <p className="text-xs font-black">Nenhum portfólio adicionado</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: FAQ (Tech & Company Only) */}
            {activeTab === 'faq' && isTech && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <HelpCircle size={18} className="text-amber-500" /> FAQ de Dúvidas Comuns
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Escreva respostas automáticas para as perguntas mais comuns enviadas por clientes.</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Pergunta do Cliente</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Vocês oferecem garantia estendida no serviço?" value={faqQuestion} onChange={e => setFaqQuestion(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sua Resposta Completa</label>
                      <textarea className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111119] p-3 text-xs font-semibold outline-none focus:border-indigo-500 resize-none" rows={2} placeholder="Sim, fornecemos 90 dias padrão de garantia e opções de..." value={faqAnswer} onChange={e => setFaqAnswer(e.target.value)} />
                    </div>
                    <button disabled={!faqQuestion || !faqAnswer || createFaqMutation.isPending} onClick={() => createFaqMutation.mutate({ question: faqQuestion, answer: faqAnswer })} className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-50">
                      {createFaqMutation.isPending ? 'Adicionando...' : 'Adicionar Pergunta'}
                    </button>
                  </div>

                  <div className="space-y-3 mt-6">
                    {formData.faqs?.map((faq) => (
                      <div key={faq.id} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black/20 relative group">
                        <button onClick={() => deleteFaqMutation.mutate(faq.id)} className="absolute top-2.5 right-2.5 h-8 w-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white pr-8">Q: {faq.question}</h4>
                        <p className="text-[11px] text-zinc-550 mt-1 font-semibold">R: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SECURITY & CREDENTIALS (Tech & Company Only) */}
            {activeTab === 'security' && isTech && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Selfie & KYC */}
                  <div className="md:col-span-2 space-y-6">
                    
                    {/* Selfie & Liveness */}
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-500" /> Prova de Vida (Biometria Facial)
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-6">
                        {formData.selfieUrl ? (
                          <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-emerald-500/20">
                            <img src={formData.selfieUrl} className="h-full w-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1"><CheckCircle size={12}/> Verificado via IA</span>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-44 w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                            <Camera size={32} className="text-indigo-500 mb-2 animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300">Tirar Selfie</span>
                            <span className="text-[9px] text-zinc-500 mt-1">Use a câmera frontal</span>
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
                                } catch (error) { console.error(error); alert('Erro ao processar selfie facial.'); }
                              }}
                            />
                          </label>
                        )}

                        <div className="space-y-3 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-zinc-500">Status KYC</h4>
                            <KycBadge status={formData.kycStatus} />
                          </div>
                          <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                            A checagem facial liveness garante que a foto do seu perfil coincide com seus documentos criminais e civis.
                          </p>
                          <button
                            onClick={() => kycMutation.mutate()}
                            disabled={kycMutation.isPending}
                            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            <RefreshCw size={12} className={kycMutation.isPending ? 'animate-spin' : ''} />
                            Reciclar KYC
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Certificados Upload */}
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                        <Award size={16} className="text-amber-500" /> Selos de Capacitação & Diplomas
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.certificates?.map((cert: string, idx: number) => (
                          <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 group">
                            <img src={cert} alt="Certificate" className="h-full w-full object-cover" />
                            <button
                              onClick={() => setFormData(prev => ({ ...prev, certificates: prev.certificates?.filter((_, i) => i !== idx) }))}
                              className="absolute top-1.5 right-1.5 h-7 w-7 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        <div className="aspect-[4/3] w-full">
                          <FileUpload onUpload={(urls) => setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), ...urls] }))} maxFiles={5} label="Adicionar (.jpg/.png)" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar switches de conformidade e inputs operacionais */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
                        <FileText size={16} className="text-indigo-500" /> Conformidade B2B
                      </h3>

                      <div className="space-y-2">
                        {[
                          { key: 'emitsNFe', title: 'Emissão de NF-e', desc: 'Emite notas fiscais de serviços' },
                          { key: 'insuranceActive', title: 'Seguro de Danos', desc: 'Responsabilidade civil ativo' },
                          { key: 'nr10Certified', title: 'Selos NR-10', desc: 'Segurança em redes elétricas' },
                          { key: 'nr35Certified', title: 'Selos NR-35', desc: 'Qualificação para trabalhos em altura' }
                        ].map((selo) => (
                          <label key={selo.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black/10 cursor-pointer select-none">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-zinc-200">{selo.title}</span>
                              <span className="text-[9px] text-zinc-550 block leading-none font-semibold">{selo.desc}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!(formData as any)[selo.key]}
                              onChange={(e) => setFormData(prev => ({ ...prev, [selo.key]: e.target.checked }))}
                              className="rounded border-zinc-300 dark:border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Dados Operacionais</h3>
                      
                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Horário de Atendimento</span>
                          <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none" placeholder="Ex: Seg a Sex, 8h às 18h" value={formData.operatingHours || ''} onChange={e => setFormData(prev => ({ ...prev, operatingHours: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tempo de Resposta (SLA)</span>
                          <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none" placeholder="Ex: 1 hora" value={formData.responseTime || ''} onChange={e => setFormData(prev => ({ ...prev, responseTime: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Área de Cobertura</span>
                          <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none" placeholder="Ex: Campinas e Região" value={formData.coverageArea || ''} onChange={e => setFormData(prev => ({ ...prev, coverageArea: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Meios de Pagamento</span>
                          <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none" placeholder="Ex: Pix, Crédito, Cartão faturado" value={formData.paymentMethods || ''} onChange={e => setFormData(prev => ({ ...prev, paymentMethods: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Garantia Oferecida</span>
                          <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 outline-none" placeholder="Ex: 90 dias em peças e mão de obra" value={formData.contractWarranty || ''} onChange={e => setFormData(prev => ({ ...prev, contractWarranty: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: FINANCIAL (Tech & Company Only) */}
            {activeTab === 'financial' && isTech && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Balance display */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 h-28 w-28 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Saldo Disponível</span>
                    <h3 className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
                      R$ {formData.balance ? Number(formData.balance).toFixed(2) : '0,00'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1.5 font-bold">Transferível imediatamente para sua conta PIX cadastrada.</p>
                  </div>

                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl"></div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Saldo em Garantia (Custódia)</span>
                    <h3 className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
                      R$ {formData.escrowBalance ? Number(formData.escrowBalance).toFixed(2) : '0,00'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1.5 font-bold">Valores retidos aguardando conclusão dos serviços pelos clientes.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Cadastro de Conta Bancária */}
                  <form onSubmit={handleSaveBankDetails} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Landmark size={16} className="text-indigo-500" /> Dados para Recebimento
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Instituição Bancária</label>
                      <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Itaú Unibanco" value={bankName} onChange={e => setBankName(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Agência</label>
                        <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="0001" value={bankAgency} onChange={e => setBankAgency(e.target.value)} />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Conta e Dígito</label>
                        <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="12345-6" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tipo de Conta</label>
                      <select className="w-full bg-slate-50 dark:bg-[#111119] border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" value={bankAccountType} onChange={e => setBankAccountType(e.target.value)}>
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Conta Poupança</option>
                        <option value="facil">Conta de Pagamento</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Chave PIX</label>
                      <div className="flex gap-2">
                        <select className="bg-slate-50 dark:bg-[#111119] border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-[10px] font-black uppercase tracking-wider outline-none focus:border-indigo-500" value={pixKeyType} onChange={e => setPixKeyType(e.target.value)}>
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="email">Email</option>
                          <option value="phone">Celular</option>
                          <option value="aleatoria">Chave Aleatória</option>
                        </select>
                        <input className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Insira a chave" value={pixKey} onChange={e => setPixKey(e.target.value)} />
                      </div>
                    </div>

                    <button type="submit" className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs transition-all shadow-md active:scale-95">
                      Salvar Dados Bancários
                    </button>
                  </form>

                  {/* Histórico de Repasses */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Histórico Recente de Resgates</h3>
                    
                    <div className="space-y-3">
                      {payouts.map((pay) => (
                        <div key={pay.id} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <CreditCard size={18} className="text-emerald-500" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">Resgate no canal {pay.type}</h4>
                              <p className="text-[10px] text-zinc-550 font-semibold">{pay.date}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900 dark:text-white">R$ {pay.amount.toFixed(2)}</p>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase mt-1 ${
                              pay.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500 animate-pulse'
                            }`}>
                              {pay.status === 'completed' ? 'Finalizado ✅' : 'Processando ⚙️'}
                            </span>
                          </div>
                        </div>
                      ))}

                      {payouts.length === 0 && (
                        <div className="py-12 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl opacity-60">
                          <p className="text-xs font-bold">Nenhum repasse realizado ainda.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: OUR TEAM (Company Only) */}
            {activeTab === 'team' && isCompany && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Cadastrar auxiliar */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Plus size={16} className="text-indigo-500" /> Cadastrar Técnico Auxiliar
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Nome Completo</label>
                      <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Roberto Ramos" value={memberName} onChange={e => setMemberName(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Cargo / Função Especializada</label>
                      <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Ex: Eletricista Predial" value={memberRole} onChange={e => setMemberRole(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Telefone Contato</label>
                      <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="(11) 98888-8888" value={memberPhone} onChange={e => setMemberPhone(e.target.value)} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Status Operacional Inicial</label>
                      <select className="w-full bg-slate-50 dark:bg-[#111119] border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" value={memberStatus} onChange={e => setMemberStatus(e.target.value)}>
                        <option value="active">Disponível para Chamados (Ativo)</option>
                        <option value="inactive">Indisponível (Inativo)</option>
                      </select>
                    </div>

                    <button type="button" onClick={handleAddTeamMember} className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs transition-all shadow-md active:scale-95">
                      Salvar Membro na Equipe
                    </button>
                  </div>

                  {/* Lista de Auxiliares */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Técnicos da nossa Equipe</h3>
                    
                    <div className="grid gap-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">{member.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-bold">{member.role} • {member.phone}</p>
                              <button
                                type="button"
                                onClick={() => handleToggleTeamStatus(member.id)}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                                  member.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                }`}
                              >
                                {member.status === 'active' ? 'Disponível ✅' : 'Pausado 🚫'}
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTeamMember(member.id)}
                            className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {teamMembers.length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl opacity-60">
                          <Users size={32} className="mx-auto mb-3 text-zinc-500" />
                          <p className="text-xs font-black">Nenhum técnico cadastrado na empresa.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: ADMIN PANEL (Admin Only) */}
            {activeTab === 'admin-panel' && isAdmin && (
              <motion.div
                key="admin-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Admin cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Total Usuários</span>
                    <p className="text-2xl font-black mt-2 text-indigo-500">12.450</p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">Chamados Hoje</span>
                    <p className="text-2xl font-black mt-2 text-emerald-500">1.840</p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">Faturamento Médio</span>
                    <p className="text-2xl font-black mt-2 text-cyan-500">R$ 184K</p>
                  </div>
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                    <span className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">Fila KYC Pendente</span>
                    <p className="text-2xl font-black mt-2 text-rose-500">23</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Configurações Globais do Sistema */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Settings size={16} className="text-indigo-500" /> Configuração do Sistema
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Taxa de Comissão da Plataforma (%)</label>
                      <input type="number" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
                    </div>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-black/10 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-200">Modo de Manutenção</span>
                        <span className="text-[9px] text-zinc-500 block font-semibold">Desativa chamados temporariamente</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Transmitir Alerta Global</label>
                      <input className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500" placeholder="Mensagem para todos os usuários" value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} />
                    </div>

                    <button type="button" onClick={handleSaveAdminSettings} className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs transition-all shadow-md active:scale-95">
                      Aplicar Ajustes Globais
                    </button>
                  </div>

                  {/* Fila de Moderação */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Moderação de Documentos (Pendências)</h3>
                    
                    <div className="space-y-3">
                      {[
                        { id: 'm1', name: 'Bruno Vidraceiro', type: 'CNH / Selfie divergente', date: 'Há 1 hora' },
                        { id: 'm2', name: 'Assistência Master SP', type: 'CNPJ inválido / inativo', date: 'Há 3 horas' }
                      ].map((item) => (
                        <div key={item.id} className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] text-rose-500 font-semibold">{item.type}</p>
                            <p className="text-[9px] text-zinc-550 font-medium">{item.date}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all text-emerald-500">
                              Aprovar
                            </button>
                            <button className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all text-rose-500">
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: SETTINGS & PREFERENCES */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* Notificações */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Bell size={22} className="text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações em Tempo Real</h3>
                        <p className="text-xs text-zinc-550 mt-1">Receba alertas de novos orçamentos, chamados ou mensagens em tempo real.</p>
                      </div>
                    </div>

                    <button
                      onClick={handleEnableNotifications}
                      disabled={pushStatus === 'granted' || isSubscribing}
                      className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        pushStatus === 'granted'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                      }`}
                    >
                      {isSubscribing ? 'Ativando...' : pushStatus === 'granted' ? 'Notificações Ativas ✅' : 'Ativar Notificações Push'}
                    </button>
                  </div>

                  {/* Interface Tema */}
                  <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Eye size={22} className="text-cyan-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aparência da Plataforma</h3>
                        <p className="text-xs text-zinc-550 mt-1">Selecione o tema visual de sua preferência para navegação no Buscador Técnico.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleThemeChange('light')}
                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                          theme === 'light'
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-500'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500'
                        }`}
                      >
                        Tema Claro (Light)
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleThemeChange('dark')}
                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-indigo-400 bg-indigo-500/5 text-indigo-400'
                            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500'
                        }`}
                      >
                        Tema Escuro (Dark)
                      </button>
                    </div>
                  </div>

                </div>

                {/* Exclusão da conta */}
                <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-rose-500 uppercase tracking-wider">Desativação de Conta</h4>
                    <p className="text-xs text-zinc-550">Ao excluir, todos os seus dados pessoais, históricos e selos de conformidade serão revogados permanentemente.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja solicitar a exclusão de sua conta? Esta ação é irreversível.')) {
                        alert('Solicitação de exclusão encaminhada ao suporte administrativo.');
                      }
                    }}
                    className="px-5 py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider shrink-0"
                  >
                    Excluir Conta
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* GLOBAL SAVE ACTION FLOATING WIDGET FOR BASICS */}
          {(activeTab === 'personal' || activeTab === 'security') && (
            <div className="sticky bottom-6 z-40 mt-8 pt-4">
              <div className="p-3 bg-white/70 dark:bg-black/60 border border-slate-200 dark:border-zinc-800 backdrop-blur-xl rounded-2xl flex items-center justify-between gap-4 max-w-2xl mx-auto shadow-2xl">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-3 font-semibold uppercase tracking-wider">Você possui alterações não salvas</p>
                <button
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={updateMutation.isPending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Salvando...' : <><Save size={14} /> Salvar Tudo</>}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
