'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiPost } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/lib/store';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  X,
  UploadCloud,
  Briefcase,
  Eye,
  EyeOff,
  MapPin,
  TrendingUp,
  Navigation,
  Cpu,
  Building,
  Star
} from 'lucide-react';
import Link from 'next/link';


type UserType = 'client' | 'technician' | 'company';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>('client');
  const [direction, setDirection] = useState(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]);
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateStr, setStateStr] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const totalSteps = userType === 'client' ? 2 : 3;

  const isStrongPassword = (p: string) => p.length >= 8 && /[A-Z]/.test(p) && (/[0-9]/.test(p) || /[\W_]/.test(p));

  const registerMutation = useMutation({
    mutationFn: (cleanEmail: string) => {
      const payload = { 
        name, 
        email: cleanEmail, 
        password, 
        userType, 
        acceptTerms,
        bio: userType === 'client' ? undefined : bio, 
        specialties: userType === 'client' ? undefined : specialties, 
        certificates: userType === 'client' ? undefined : certificates,
        document: userType === 'client' ? undefined : document,
        address: userType === 'client' ? undefined : address,
        city: userType === 'client' ? undefined : city,
        state: userType === 'client' ? undefined : stateStr,
        zipCode: userType === 'client' ? undefined : zipCode
      };
      return apiPost<AuthResponse>('/auth/register', payload);
    },
    onSuccess: (data) => {
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1])) as { userType: string };
        setSession(data.accessToken, payload.userType as any);
        if (payload.userType === 'admin') {
          router.push('/admin');
        } else if (payload.userType === 'technician' || payload.userType === 'company') {
          router.push('/opportunities');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error decoding register token:', err);
        router.push('/login');
      }
    },
  });

  const handleNextStep1 = () => {
    const cleanEmail = email.trim().toLowerCase();
    setEmail(cleanEmail);

    if (!cleanEmail.includes('@')) {
      setEmailError('O e-mail deve conter o caractere "@".');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Por favor, insira um e-mail em formato válido (ex: nome@dominio.com).');
      return;
    }

    setEmailError(null);
    nextStep();
  };

  const addTag = () => {
    if (newTag && !specialties.includes(newTag)) {
      setSpecialties([...specialties, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setSpecialties(specialties.filter(t => t !== tag));

  const nextStep = () => {
    setDirection(1);
    setStep(prev => prev + 1);
  };
  const prevStep = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <main className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:grid lg:grid-cols-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Lado Esquerdo: Branding e Imersão */}
      <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-b from-[#0b0f19] to-[#04060d] border-r border-white/5 z-10">
        {/* Grid pattern background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0" />
        
        {/* Glow Spheres */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-400 backdrop-blur-md">
             <Briefcase size={12} className="fill-current text-blue-400" /> O Futuro dos Serviços
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.1] text-white">
            {userType === 'client' ? (
              <>
                Encontre os melhores <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Técnicos</span><br/>com Garantia e IA.
              </>
            ) : userType === 'company' ? (
              <>
                Gerencie sua <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Equipe</span><br/>e multiplique ganhos.
              </>
            ) : (
              <>
                Transforme suas <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Habilidades</span><br/>em Negócio Escalável.
              </>
            )}
          </h1>
          <p className="max-w-md text-base text-zinc-400 leading-relaxed font-medium">
            {userType === 'client' ? (
              "Abra chamados em segundos, receba diagnósticos automáticos por IA e conte com pagamentos retidos em segurança até a conclusão do serviço."
            ) : userType === 'company' ? (
              "Despache ordens de serviço, rastreie técnicos em tempo real, gerencie múltiplos profissionais e centralize seus recebimentos em uma única plataforma B2B."
            ) : (
              "Junte-se a uma rede de elite de clientes e técnicos. Gere confiança instantânea e receba pagamentos com total segurança e suporte digital."
            )}
          </p>
        </div>

        {/* Widget Imersivo: Preview Dinâmico do Dashboard */}
        <div className="relative z-10 my-6 w-full max-w-md">
          <div className="relative group w-full">
            {/* Efeito Glow atrás do widget */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 to-indigo-500/30 rounded-[2.5rem] blur-md opacity-50 group-hover:opacity-75 transition duration-1000"></div>
            
            {/* Widget Principal */}
            <div className="relative bg-zinc-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden min-h-[360px] flex flex-col justify-between">
              
              <AnimatePresence mode="wait">
                {userType === 'client' && (
                  <motion.div
                    key="client-widget"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header do Widget */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Radar de Busca</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                          TechFix Finder
                        </span>
                      </div>

                      {/* Corpo - Mapa e status */}
                      <div className="space-y-5 mt-4">
                        {/* Mapa Minimalista Estilizado */}
                        <div className="relative h-32 w-full rounded-2xl bg-zinc-900/60 border border-white/5 overflow-hidden flex items-center justify-center">
                          {/* Background coordinate grid */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]" />
                          {/* Pulsating circles */}
                          <div className="absolute h-28 w-28 rounded-full border border-blue-500/5 animate-ping" />
                          <div className="absolute h-16 w-16 rounded-full border border-blue-500/10 animate-pulse" />
                          {/* Scanner radar sweeper */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent origin-center rotate-45 animate-spin" style={{ animationDuration: '8s' }} />

                          {/* Map simulation pins */}
                          <div className="absolute top-4 left-6 flex items-center gap-2 bg-zinc-950/90 border border-white/10 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
                            <MapPin size={8} className="text-blue-400 animate-bounce" />
                            <span className="text-[8px] font-mono tracking-tight text-zinc-300">Carlos (Eletricista) • 500m</span>
                          </div>
                          
                          <div className="absolute bottom-4 right-6 flex items-center gap-2 bg-zinc-950/90 border border-white/10 px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
                            <MapPin size={8} className="text-cyan-400 animate-bounce" style={{ animationDelay: '1s' }} />
                            <span className="text-[8px] font-mono tracking-tight text-zinc-300">Ana (Climatização) • 1.2km</span>
                          </div>
                          
                          {/* Center user pin */}
                          <div className="relative flex items-center justify-center">
                            <div className="absolute h-8 w-8 rounded-full bg-blue-500/15 border border-blue-500/30 animate-pulse" />
                            <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] text-white font-black shadow-lg shadow-blue-500/50">U</div>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black text-white">Reparo Residencial Urgente</h3>
                            <p className="text-[10px] font-bold text-zinc-500 mt-1">Técnico Encontrado • Carlos S.</p>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded-full shrink-0">
                            A Caminho
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Garantia Escrow */}
                    <div className="flex items-center justify-between bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Proteção de Pagamento</p>
                          <p className="text-xs font-black text-white font-mono">R$ 150,00 Retidos</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        Seguro
                      </span>
                    </div>
                  </motion.div>
                )}

                {userType === 'technician' && (
                  <motion.div
                    key="technician-widget"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header do Widget */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Central de Inteligência</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                          TechFix AI v2.6
                        </span>
                      </div>

                      {/* Corpo - Chamado Atual */}
                      <div className="space-y-4 mt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-black text-white">Instalação Multi-Split</h3>
                            <p className="text-[10px] font-bold text-zinc-500 mt-1">Cliente: Ana Clara S. • Rio de Janeiro</p>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                            Aprovado
                          </span>
                        </div>

                        {/* Caixa de Diagnóstico IA */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                            <Cpu size={12} />
                            Diagnóstico AI
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                            "Identificada compatibilidade estrutural. Carga de gás (R410A) e fiação de 6mm recomendadas. Análise de segurança de rede elétrica aprovada."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Garantia Escrow */}
                    <div className="flex items-center justify-between bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Garantia Retida (Escrow)</p>
                          <p className="text-xs font-black text-white font-mono">R$ 1.850,00</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        Seguro
                      </span>
                    </div>
                  </motion.div>
                )}

                {userType === 'company' && (
                  <motion.div
                    key="company-widget"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header do Widget */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Gestão Corporativa</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                          Console B2B
                        </span>
                      </div>

                      {/* Corpo - Estatísticas e Rotas */}
                      <div className="space-y-4 mt-4">
                        {/* Estatísticas Rápidas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-1 hover:border-white/10 transition-colors">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Técnicos Ativos</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-white font-mono">5 / 8</span>
                              <span className="text-[10px] text-emerald-400 font-bold">Em Campo</span>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-1 hover:border-white/10 transition-colors">
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ganhos do Mês</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-white font-mono">R$ 24.300</span>
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <TrendingUp size={10} /> +12%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Monitoramento de Rota */}
                        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                            <span className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              Rota #104 • Equipe Alpha
                            </span>
                            <span className="text-blue-400 font-mono text-[11px]">80%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden p-[1px]">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '80%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Faturamento Protegido */}
                    <div className="flex items-center justify-between bg-zinc-950/60 border border-white/5 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                          <Building size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Escrow Consolidado</p>
                          <p className="text-xs font-black text-white font-mono">R$ 12.400,00</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        Garantido
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-zinc-950/60 border border-white/5 p-5 w-full max-w-md rounded-[2rem] backdrop-blur-2xl shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
                'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100&h=100'
              ].map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt="Profissional parceiro" 
                  className="h-9 w-9 rounded-full border-2 border-zinc-950 object-cover shadow-lg"
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Plataforma Recomendada</p>
              <p className="text-[10px] text-zinc-400 font-medium">Por mais de <span className="text-blue-400 font-bold">15.000 parceiros</span></p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5 border-l border-white/5 pl-4 shrink-0">
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} className="fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-black text-white font-mono">4.9 / 5.0</span>
          </div>
        </div>
      </section>

      {/* Lado Direito: Formulário e Ações */}
      <section className="w-full flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-20 bg-white dark:bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          
          {/* Progress Bar Premium */}
          <div className="relative flex items-center justify-between mb-12">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full z-0" />
            {/* Active Line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
            
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="relative z-10 bg-white dark:bg-[#0a0a0a] px-2 sm:px-4">
                <div className={`flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${step >= s ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500'}`}>
                  {step > s ? <CheckCircle2 size={16} /> : <span className="text-[12px] sm:text-sm font-bold">{s}</span>}
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Criar Conta</h2>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Escolha o seu perfil para iniciar a jornada.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { id: 'client', label: 'Cliente', icon: <User />, desc: 'Reparos rápidos' },
                    { id: 'technician', label: 'Técnico', icon: <Settings />, desc: 'Atender pedidos' },
                    { id: 'company', label: 'Empresa', icon: <ShieldCheck />, desc: 'Múltiplos técnicos' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setUserType(type.id as UserType)}
                      onMouseMove={handleMouseMove}
                      className={`glow-card-container glass-card !bg-transparent p-4 text-center transition-all border ${userType === type.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' : 'border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20 bg-white dark:bg-white/5'}`}
                    >
                      <div className="glow-card-border" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${userType === type.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                          {type.icon}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{type.label}</h3>
                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                   <button 
                     onClick={() => window.location.href = 'http://localhost:3001/auth/google'}
                     className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-3.5 text-sm font-bold text-slate-700 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.98]"
                   >
                     <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
                     Continuar com Google
                   </button>
                   <button 
                     onClick={() => window.location.href = 'http://localhost:3001/auth/apple'}
                     className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-900 dark:border-white/10 dark:bg-white py-3.5 text-sm font-bold text-white dark:text-black transition-all hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98]"
                   >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      Continuar com Apple
                   </button>
                </div>

                <div className="relative text-center w-full my-6">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10"></div></div>
                   <span className="relative bg-white dark:bg-[#0a0a0a] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Ou crie com e-mail</span>
                </div>

                <div className="space-y-5">
                  <div className="relative group">
                    <input 
                      id="name"
                      type="text" 
                      placeholder=" " 
                      className="peer floating-input" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                    />
                    <label 
                      htmlFor="name" 
                      className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                    >
                      Nome Completo
                    </label>
                  </div>

                  <div className="relative group">
                    <input 
                      id="email"
                      type="text" 
                      placeholder=" " 
                      className="peer floating-input" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                    <label 
                      htmlFor="email" 
                      className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                    >
                      E-mail Profissional
                    </label>
                    {emailError && <p className="text-[10px] ml-1 mt-1.5 font-bold text-rose-500">{emailError}</p>}
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div className="relative group">
                      <input 
                        id="password"
                        className="peer floating-input w-full pr-10" 
                        type={showPassword ? "text" : "password"} 
                        placeholder=" " 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                      />
                      <label 
                        htmlFor="password" 
                        className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                      >
                        Senha
                      </label>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div className="relative group">
                      <input 
                        id="confirmPassword"
                        className="peer floating-input w-full pr-10" 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder=" " 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                      />
                      <label 
                        htmlFor="confirmPassword" 
                        className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                      >
                        Confirmação
                      </label>
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {password && (() => {
                    const getPasswordStrength = (p: string) => {
                      if (!p) return 0;
                      let score = 0;
                      if (p.length >= 8) score++;
                      if (/[A-Z]/.test(p)) score++;
                      if (/[0-9]/.test(p) || /[\W_]/.test(p)) score++;
                      return score;
                    };
                    const strength = getPasswordStrength(password);
                    const colors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
                    const labels = ['Fraca', 'Média', 'Forte'];
                    return (
                      <div className="space-y-2 px-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                          <span className="text-slate-400">Força da Senha</span>
                          <span className={strength === 3 ? 'text-emerald-500' : strength === 2 ? 'text-amber-500' : 'text-rose-500'}>
                            {labels[strength - 1] || 'Fraca'}
                          </span>
                        </div>
                        <div className="flex gap-1.5 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${colors[strength - 1] || 'bg-rose-500'}`} style={{ width: `${(strength / 3) * 100}%` }} />
                        </div>
                        {!isStrongPassword(password) && (
                          <p className="text-[9px] text-amber-500/80 font-semibold leading-tight">
                            Recomendado: 8+ caracteres, uma letra maiúscula e um número ou símbolo.
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <button 
                  onClick={handleNextStep1}
                  disabled={!name || !email || !isStrongPassword(password) || password !== confirmPassword}
                  className="btn-primary w-full py-4 mt-2 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  Continuar Cadastro <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && userType === 'client' && (
              <motion.div 
                key="step2-client"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Termos e Consentimento</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Leia e aceite as diretrizes para finalizarmos o seu cadastro de Cliente.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 rounded-2xl bg-blue-500/[0.04] dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 p-5 backdrop-blur-md">
                   <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                   </div>
                   <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-200">
                     Sua conta de Cliente no <strong className="text-blue-600 dark:text-white font-bold">TechFix</strong> te dá acesso a técnicos certificados na sua região com pagamentos 100% seguros em garantia (escrow).
                   </p>
                </div>

                {/* LGPD — Consentimento Explícito */}
                <label className={`flex items-start gap-3 cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                  acceptTerms 
                    ? 'border-emerald-500/50 bg-emerald-500/[0.04] dark:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.03)]' 
                    : 'border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                }`}>
                  <input
                    id="accept-terms-client"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Li e aceito os{' '}
                    <Link href="/legal" target="_blank" className="font-bold text-blue-500 hover:underline">
                      Termos de Uso
                    </Link>{' '}e a{' '}
                    <Link href="/legal" target="_blank" className="font-bold text-blue-500 hover:underline">
                      Política de Privacidade (LGPD)
                    </Link>. Autorizo o tratamento dos meus dados pessoais conforme descrito na política.
                  </span>
                </label>
              </div>

              {/* Mutation Error Feedback */}
              {registerMutation.error && (
                <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-600 dark:text-rose-400 backdrop-blur-md shadow-lg shadow-rose-500/[0.02]">
                  {registerMutation.error.message}
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button onClick={prevStep} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 dark:border-white/10 bg-transparent px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-200">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                  onClick={() => registerMutation.mutate(email.trim().toLowerCase())}
                  disabled={registerMutation.isPending || !acceptTerms}
                  className="btn-primary flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerMutation.isPending ? 'Validando...' : 'Finalizar Cadastro'} <CheckCircle2 size={16} className={registerMutation.isPending ? 'hidden' : ''} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && userType !== 'client' && (
            <motion.div 
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Seu Perfil no TechFix</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Descreva sua trajetória e atraia mais clientes.</p>
              </div>

              <div className="space-y-5">
                <div className="relative group">
                  <input 
                    id="document"
                    className="peer floating-input" 
                    placeholder=" " 
                    value={document}
                    onChange={(e) => {
                      let clean = e.target.value.replace(/\D/g, '');
                      if (userType === 'technician') {
                        clean = clean.substring(0, 11);
                        clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
                        clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
                        clean = clean.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                      } else {
                        clean = clean.substring(0, 14);
                        clean = clean.replace(/(\d{2})(\d)/, '$1.$2');
                        clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
                        clean = clean.replace(/(\d{3})(\d)/, '$1/$2');
                        clean = clean.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                      }
                      setDocument(clean);
                    }}
                  />
                  <label 
                    htmlFor="document" 
                    className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                  >
                    {userType === 'company' ? 'CNPJ' : 'CPF'}
                  </label>
                </div>

                <div className="relative group">
                  <input 
                    id="zipCode"
                    className="peer floating-input" 
                    placeholder=" " 
                    value={zipCode}
                    onChange={(e) => {
                      let clean = e.target.value.replace(/\D/g, '');
                      clean = clean.substring(0, 8);
                      clean = clean.replace(/(\d{5})(\d)/, '$1-$2');
                      setZipCode(clean);
                    }}
                  />
                  <label 
                    htmlFor="zipCode" 
                    className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                  >
                    CEP
                  </label>
                </div>

                <div className="relative group">
                  <input 
                    id="address"
                    className="peer floating-input" 
                    placeholder=" " 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                  />
                  <label 
                    htmlFor="address" 
                    className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                  >
                    Endereço (Rua, Número)
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <input 
                      id="city"
                      className="peer floating-input" 
                      placeholder=" " 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                    />
                    <label 
                      htmlFor="city" 
                      className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                    >
                      Cidade
                    </label>
                  </div>
                  <div className="relative group">
                    <input 
                      id="stateStr"
                      className="peer floating-input" 
                      placeholder=" " 
                      value={stateStr} 
                      onChange={e => setStateStr(e.target.value)} 
                    />
                    <label 
                      htmlFor="stateStr" 
                      className="floating-label text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1"
                    >
                      Estado
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Sua Biografia & Diferenciais</label>
                  <textarea 
                    className="input-field min-h-[140px] resize-none" 
                    placeholder="Fale sobre seus anos de experiência, ferramentas de ponta que utiliza e como garante a satisfação do cliente..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Especialidades (Tags)</label>
                  <div className="flex gap-2">
                    <input 
                      className="input-field" 
                      placeholder="Ex: Instalação de Split, DryWall..." 
                      value={newTag} 
                      onChange={e => setNewTag(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && addTag()} 
                    />
                    <button onClick={addTag} className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors">
                      <Plus size={20} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {specialties.length === 0 && <span className="text-xs text-slate-500 ml-1">Nenhuma tag adicionada.</span>}
                    {specialties.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-700 dark:text-slate-300">
                        {tag} <X size={12} className="cursor-pointer text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors" onClick={() => removeTag(tag)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={prevStep} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!bio || specialties.length === 0 || !document || !address || !city || !stateStr || !zipCode}
                  className="btn-primary flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Próximo Passo <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && userType !== 'client' && (
            <motion.div 
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Selo de Credibilidade</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Adicione certificados e feche mais negócios.</p>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-10 text-center transition-all hover:border-blue-500/50 dark:hover:border-blue-500/30 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
                   <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                      <UploadCloud size={32} />
                   </div>
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Upload de Certificados</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Formatos suportados: .jpg, .png, .pdf</p>
                </div>
                
                <div className="flex items-center gap-4 rounded-2xl bg-blue-500/[0.04] dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 p-5 backdrop-blur-md">
                   <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <ShieldCheck size={20} />
                   </div>
                   <p className="text-xs leading-relaxed text-slate-700 dark:text-blue-200">
                     Documentação correta aumenta sua visibilidade em até <strong className="text-blue-600 dark:text-white font-bold">80% no marketplace</strong>, garantindo mais segurança aos clientes.
                   </p>
                </div>

                {/* LGPD — Consentimento Explícito */}
                <label className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition-all ${
                  acceptTerms 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' 
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'
                }`}>
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Li e aceito os{' '}
                    <Link href="/legal" target="_blank" className="font-bold text-blue-500 hover:underline">
                      Termos de Uso
                    </Link>{' '}e a{' '}
                    <Link href="/legal" target="_blank" className="font-bold text-blue-500 hover:underline">
                      Política de Privacidade (LGPD)
                    </Link>. Autorizo o tratamento dos meus dados pessoais conforme descrito na política.
                  </span>
                </label>
              </div>

              {/* Mutation Error Feedback */}
              {registerMutation.error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                  {registerMutation.error.message}
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button onClick={prevStep} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <ArrowLeft size={16} /> Voltar
                </button>
                <button 
                  onClick={() => registerMutation.mutate(email.trim().toLowerCase())}
                  disabled={registerMutation.isPending || !acceptTerms}
                  className="btn-primary flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registerMutation.isPending ? 'Validando...' : 'Finalizar Cadastro'} <CheckCircle2 size={16} className={registerMutation.isPending ? 'hidden' : ''} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Já construiu seu império? <Link href="/login" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">Acesse aqui.</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
