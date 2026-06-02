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
  EyeOff
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
  const [acceptTerms, setAcceptTerms] = useState(false);

  const totalSteps = userType === 'client' ? 2 : 3;

  const isStrongPassword = (p: string) => p.length >= 8 && /[A-Z]/.test(p) && (/[0-9]/.test(p) || /[\W_]/.test(p));

  const registerMutation = useMutation({
    mutationFn: () => {
      const payload = { 
        name, 
        email, 
        password, 
        userType, 
        acceptTerms,
        bio: userType === 'client' ? undefined : bio, 
        specialties: userType === 'client' ? undefined : specialties, 
        certificates: userType === 'client' ? undefined : certificates 
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
          router.push('/technician/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error decoding register token:', err);
        router.push('/login');
      }
    },
  });

  const addTag = () => {
    if (newTag && !specialties.includes(newTag)) {
      setSpecialties([...specialties, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setSpecialties(specialties.filter(t => t !== tag));

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <main className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:grid lg:grid-cols-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Lado Esquerdo: Branding e Imersão */}
      <section className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-black/50 border-r border-slate-100 dark:border-white/10">
        <div className="absolute inset-0 z-0 opacity-20 blur-[100px] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen animate-pulse" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-white focus:outline-none mb-12">
             <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">TF</div>
             <span className="text-xl">Tech<span className="text-blue-500 font-bold">Fix</span></span>
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md">
             <Briefcase size={14} className="fill-current" /> O Futuro dos Serviços
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1]">
            Transforme suas <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Habilidades</span><br/>em um Negócio Escalável.
          </h1>
          <p className="max-w-md text-lg text-slate-400 leading-relaxed">
            Junte-se a uma rede de elite de clientes e técnicos. Gere confiança instantânea e receba pagamentos com total segurança.
          </p>
        </div>

        <div className="relative z-10 glass-card p-6 mt-12 bg-white/5 border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-4">
              {[1,2,3].map(i => (
                <div key={i} className={`h-10 w-10 rounded-full border-2 border-slate-100 dark:border-[#0a0a0a] bg-slate-200 dark:bg-slate-800 flex items-center justify-center`} />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Mais de <span className="font-bold text-slate-900 dark:text-white">15.000 profissionais</span> aprovam.</p>
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
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
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
                      className={`glass-card !bg-transparent p-4 text-center transition-all border ${userType === type.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' : 'border-slate-200 dark:border-white/5 hover:border-blue-300 dark:hover:border-white/20 bg-white dark:bg-white/5'}`}
                    >
                      <div className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${userType === type.id ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}`}>
                        {type.icon}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{type.label}</h3>
                      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{type.desc}</p>
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

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nome Completo</label>
                    <input className="input-field" placeholder="Ex: João Silva" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">E-mail Profissional</label>
                    <input className="input-field" placeholder="contato@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Senha</label>
                      <div className="relative">
                        <input className="input-field w-full pr-10" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Confirmação</label>
                      <div className="relative">
                        <input className="input-field w-full pr-10" type={showConfirmPassword ? "text" : "password"} placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {password && (
                      <p className={`text-[10px] ml-1 mt-1 font-bold ${isStrongPassword(password) ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                        {isStrongPassword(password) ? '✓ Nível de segurança: Forte' : '⚠ Necessário: 8+ caracteres, uma maiúscula, um número ou símbolo.'}
                      </p>
                  )}
                </div>

                <button 
                  onClick={nextStep}
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
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
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
                  onClick={() => registerMutation.mutate()}
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
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Seu Perfil no TechFix</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Descreva sua trajetória e atraia mais clientes.</p>
              </div>

              <div className="space-y-5">
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
                  disabled={!bio || specialties.length === 0}
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
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
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
                  onClick={() => registerMutation.mutate()}
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
