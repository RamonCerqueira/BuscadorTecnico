'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { apiPost } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function LoginPage() {
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => apiPost<AuthResponse>('/auth/login', { email, password }),
    onSuccess: (data) => setSession(data.accessToken, 'client')
  });

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <section className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-cyan-300">Acesso seguro</p>
          <h1 className="text-3xl font-semibold">Entre para gerenciar solicitações e propostas</h1>
          <p className="text-slate-300">
            Plataforma com autenticação JWT, histórico de atendimento e comunicação por ticket.
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Login</h2>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3"
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-500"
              onClick={() => loginMutation.mutate()}
            >
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </button>
            {loginMutation.isError && <p className="text-sm text-red-400">Falha ao autenticar.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
