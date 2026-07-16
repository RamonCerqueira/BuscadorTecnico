'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiPost } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';

// Reusable components
import BrandingPanel from '@/components/layout/BrandingPanel';
import FloatingInput from '../register/components/FloatingInput';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (cleanEmail: string) =>
      apiPost<AuthResponse>('/auth/login', { email: cleanEmail, password }),
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
        console.error('Error decoding login token:', err);
      }
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    setEmail(cleanEmail);

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
    <main className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:grid lg:grid-cols-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Left Column: Premium Dynamic Branding widgets */}
      <BrandingPanel userType="client" />

      {/* Right Column: Login form container */}
      <section className="w-full flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-20 bg-white dark:bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="relative w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]/80 backdrop-blur-2xl shadow-2xl z-10 space-y-6"
        >
          {/* Glow effect at top card border */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-60" />

          {/* Center Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-md">
              <svg
                className="h-5 w-5 text-white dark:text-black animate-pulse"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Entrar na Plataforma
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Insira suas credenciais para gerenciar chamados
              </p>
            </div>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => (window.location.href = 'http://localhost:3001/auth/google')}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 py-3 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] transition-all duration-200"
            >
              <img src="https://www.google.com/favicon.ico" className="h-3.5 w-3.5" alt="Google" />
              Google
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = 'http://localhost:3001/auth/apple')}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 dark:bg-white py-3 text-xs font-semibold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 active:scale-[0.97] transition-all duration-200"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative text-center w-full my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-800/80"></div>
            </div>
            <span className="relative bg-white dark:bg-[#0c0c0e] px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              Ou use seu e-mail
            </span>
          </div>

          {/* Email form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <FloatingInput
              id="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={setEmail}
            />

            <FloatingInput
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {validationError && (
              <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 backdrop-blur-md">
                {validationError}
              </div>
            )}

            {loginMutation.isError && (
              <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 backdrop-blur-md">
                Credenciais inválidas. Verifique seus dados.
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              className="btn-primary w-full py-4 mt-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
            >
              {loginMutation.isPending ? 'Sincronizando...' : 'Entrar na Plataforma'}
            </button>
          </form>

          {/* Bottom register link */}
          <p className="text-center text-xs font-medium text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-900/60">
            Ainda não faz parte da elite?{' '}
            <Link
              href="/register"
              className="text-indigo-500 hover:text-indigo-400 hover:underline transition-colors duration-200"
            >
              Começar agora
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
