'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type Proposal = {
  id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  estimatedValue: string | null;
  provider: { id: string; name: string; userType: string; rating: number };
};

export default function TicketProposalsPage({ params }: { params: { ticketId: string } }) {
  const queryClient = useQueryClient();
  const [providerId, setProviderId] = useState('');
  const [message, setMessage] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [clientId, setClientId] = useState('');

  const proposalsQuery = useQuery({
    queryKey: ['proposals', params.ticketId],
    queryFn: () => apiGet<Proposal[]>(`/tickets/${params.ticketId}/proposals`)
  });

  const createProposal = useMutation({
    mutationFn: () =>
      apiPost(`/tickets/${params.ticketId}/proposals`, {
        providerId,
        message,
        estimatedValue: estimatedValue ? Number(estimatedValue) : undefined
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', params.ticketId] })
  });

  const acceptProposal = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/accept`, { clientId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', params.ticketId] })
  });

  const rejectProposal = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/reject`, { clientId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', params.ticketId] })
  });

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Propostas da Solicitação</h1>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Enviar proposta</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-slate-900/60 p-3"
            placeholder="ID do técnico/empresa"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-slate-900/60 p-3"
            placeholder="Valor estimado"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
          />
        </div>
        <textarea
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3"
          placeholder="Mensagem da proposta"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="rounded-xl bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-500"
          onClick={() => createProposal.mutate()}
        >
          {createProposal.isPending ? 'Enviando...' : 'Enviar proposta'}
        </button>
      </section>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Ações do cliente</h2>
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3"
          placeholder="ID do cliente dono do ticket"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {proposalsQuery.data?.map((proposal) => (
          <article key={proposal.id} className="glass-card p-4">
            <p className="font-semibold">
              {proposal.provider.name} <span className="text-slate-400">({proposal.provider.userType})</span>
            </p>
            <p className="mt-2 text-sm text-slate-300">{proposal.message}</p>
            <p className="mt-2 text-xs text-slate-400">Status: {proposal.status}</p>
            <div className="mt-4 flex gap-2">
              <button
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm"
                onClick={() => acceptProposal.mutate(proposal.id)}
              >
                Aceitar
              </button>
              <button
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm"
                onClick={() => rejectProposal.mutate(proposal.id)}
              >
                Rejeitar
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
