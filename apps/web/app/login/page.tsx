'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (cleanEmail: string) => apiPost<AuthResponse>('/auth/login', { email: cleanEmail, password }),
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
        console.error('Error decoding login token:', err);
      }
    }
  });

  const handleLogin = () => {
    const cleanEmail = email.trim().toLowerCase();
    setEmail(cleanEmail); // Normaliza visualmente no input

    if (!cleanEmail) {
      setValidationError('Por favor, preencha o e-mail.');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setValidationError('O e-mail deve conter o caractere "@".');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setValidationError('Por favor, insira um e-mail em formato válido (ex: nome@dominio.com).');
      return;
    }

    setValidationError(null);
    loginMutation.mutate(cleanEmail);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl items-center px-4 py-12 lg:py-20 sm:px-6 transition-colors duration-300">
      <div className="grid w-full gap-10 lg:gap-20 lg:grid-cols-2 lg:items-center">
        <section className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 border border-blue-500/20 backdrop-blur-md">
               ✨ Bem-vindo de volta
            </div>
            <h1 className="text-5xl font-black tracking-tight lg:text-7xl leading-[1.1]">
              A elite dos <br/>
              <span className="premium-gradient-text">Serviços.</span>
            </h1>
            <p className="max-w-md text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Gerencie seus chamados, analise diagnósticos com IA e acompanhe seus ganhos em uma plataforma segura.
            </p>
          </motion.div>

          <div className="flex items-center gap-6 pt-4">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-slate-200 dark:bg-slate-800 shadow-xl" />
                ))}
             </div>
             <p className="text-sm font-bold text-slate-500">Junte-se a <span className="text-slate-900 dark:text-white">15k+ profissionais</span></p>
          </div>
        </section>

        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-blue-600/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h2 className="mb-8 sm:mb-10 text-2xl sm:text-3xl font-black tracking-tight">Entrar</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-10">
              <button 
                onClick={() => window.location.href = 'http://localhost:3001/auth/google'}
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 py-4 text-sm font-black transition-all hover:bg-slate-50 dark:hover:bg-white/10 active:scale-[0.98] shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
                Google
              </button>
              <button 
                onClick={() => window.location.href = 'http://localhost:3001/auth/apple'}
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-slate-900 dark:bg-white py-4 text-sm font-black text-white dark:text-black transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl"
              >
                 <svg className="h-4 w-4 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                 Apple
              </button>
            </div>

            <div className="relative mb-10 text-center">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
               <span className="relative bg-white dark:bg-[#111] px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ou use e-mail profissional</span>
            </div>

            <div className="space-y-5">
              <input
                className="input-field"
                placeholder="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  className="input-field w-full pr-10"
                  placeholder="Senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                className="btn-primary w-full py-5 text-lg shadow-blue-600/20 mt-4"
                onClick={handleLogin}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Sincronizando...' : 'Entrar na Plataforma'}
              </button>
              {validationError && <p className="text-center text-sm text-rose-500 font-bold">{validationError}</p>}
              {loginMutation.isError && <p className="text-center text-sm text-rose-500 font-bold">Credenciais inválidas. Verifique seus dados.</p>}
              
              <p className="mt-10 text-center text-sm font-bold text-slate-500">
                Ainda não faz parte da elite?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-500 transition-colors">
                  Começar agora
                </Link>
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
