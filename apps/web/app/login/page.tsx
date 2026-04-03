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
    <main className="mx-auto min-h-screen w-full max-w-md space-y-4 px-6 py-12">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        className="w-full rounded bg-slate-900 p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded bg-slate-900 p-2"
        placeholder="Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="rounded bg-blue-600 px-4 py-2" onClick={() => loginMutation.mutate()}>
        Entrar
      </button>
      {loginMutation.isError && <p className="text-red-400">Falha ao autenticar.</p>}
    </main>
  );
}
