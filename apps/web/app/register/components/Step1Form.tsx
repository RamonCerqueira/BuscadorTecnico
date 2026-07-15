'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import RoleSelector, { UserType } from './RoleSelector';
import FloatingInput from './FloatingInput';

interface Step1FormProps {
  userType: UserType;
  setUserType: (type: UserType) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onNext: () => void;
}

export default function Step1Form({
  userType,
  setUserType,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onNext,
}: Step1FormProps) {
  const [emailError, setEmailError] = useState<string | null>(null);

  const isStrongPassword = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && (/[0-9]/.test(p) || /[\W_]/.test(p));

  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p) || /[\W_]/.test(p)) score++;
    return score;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
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
    onNext();
  };

  const strength = getPasswordStrength(password);
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['Fraca', 'Média', 'Forte'];
  const strengthLabelColor =
    strength === 3
      ? 'text-emerald-500'
      : strength === 2
      ? 'text-amber-500'
      : 'text-rose-500';

  const isFormValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    isStrongPassword(password) &&
    password === confirmPassword;

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Criar Conta</h2>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">
          Escolha o seu perfil para iniciar a jornada.
        </p>
      </div>

      <RoleSelector userType={userType} setUserType={setUserType} />

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => (window.location.href = 'http://localhost:3001/auth/google')}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 py-3.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all duration-300"
        >
          <img src="https://www.google.com/favicon.ico" className="h-4 w-4" alt="Google" />
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = 'http://localhost:3001/auth/apple')}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 border border-slate-900 dark:border-zinc-800 dark:bg-white py-3.5 text-sm font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 384 512">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          Continuar com Apple
        </button>
      </div>

      <div className="relative text-center w-full my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
        </div>
        <span className="relative bg-white dark:bg-[#0a0a0a] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
          Ou crie com e-mail
        </span>
      </div>

      <div className="space-y-4">
        <FloatingInput
          id="name"
          label="Nome Completo"
          value={name}
          onChange={setName}
        />

        <FloatingInput
          id="email"
          label="E-mail Profissional"
          type="email"
          value={email}
          onChange={setEmail}
          error={emailError}
        />

        <div className="grid gap-4 grid-cols-2">
          <FloatingInput
            id="password"
            label="Senha"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <FloatingInput
            id="confirmPassword"
            label="Confirmação"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
        </div>

        {password && (
          <div className="space-y-2 px-1">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
              <span className="text-slate-400">Força da Senha</span>
              <span className={strengthLabelColor}>{strengthLabels[strength - 1] || 'Fraca'}</span>
            </div>
            <div className="flex gap-1.5 h-1 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  strengthColors[strength - 1] || 'bg-rose-500'
                }`}
                style={{ width: `${(strength / 3) * 100}%` }}
              />
            </div>
            {!isStrongPassword(password) && (
              <p className="text-[9px] text-amber-500/80 font-semibold leading-tight">
                Recomendado: 8+ caracteres, uma letra maiúscula e um número ou símbolo.
              </p>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="btn-primary w-full py-4 mt-2 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
      >
        Continuar Cadastro <ArrowRight size={16} />
      </button>
    </form>
  );
}
