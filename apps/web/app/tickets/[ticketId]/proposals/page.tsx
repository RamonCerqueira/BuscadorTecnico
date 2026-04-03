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
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Propostas da Solicitação</h1>

      <section className="space-y-3 rounded-lg border border-slate-800 p-4">
        <h2 className="font-semibold">Enviar proposta</h2>
        <input
          className="w-full rounded bg-slate-900 p-2"
          placeholder="ID do técnico/empresa"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
        />
        <input
          className="w-full rounded bg-slate-900 p-2"
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input
          className="w-full rounded bg-slate-900 p-2"
          placeholder="Valor estimado"
          value={estimatedValue}
          onChange={(e) => setEstimatedValue(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2"
          onClick={() => createProposal.mutate()}
        >
          Enviar proposta
        </button>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-800 p-4">
        <h2 className="font-semibold">Ação do cliente</h2>
        <input
          className="w-full rounded bg-slate-900 p-2"
          placeholder="ID do cliente dono do ticket"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
      </section>

      <section className="space-y-3">
        {proposalsQuery.data?.map((proposal) => (
          <article key={proposal.id} className="rounded-lg border border-slate-800 p-4">
            <p className="font-semibold">{proposal.provider.name} ({proposal.provider.userType})</p>
            <p className="text-sm text-slate-300">{proposal.message}</p>
            <p className="text-xs text-slate-400">Status: {proposal.status}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="rounded bg-emerald-700 px-3 py-1 text-sm"
                onClick={() => acceptProposal.mutate(proposal.id)}
              >
                Aceitar
              </button>
              <button
                className="rounded bg-red-700 px-3 py-1 text-sm"
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
