'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, use } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type Proposal = {
// ... existing type Proposal ...
  id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  estimatedValue: string | null;
  provider: { 
    id: string; 
    name: string; 
    userType: string; 
    rating: number;
    specialties: string[];
    certificates: string[];
  };
};

export default function TicketProposalsPage({ params: paramsPromise }: { params: Promise<{ ticketId: string }> }) {
  const params = use(paramsPromise);
  const ticketId = params.ticketId;
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');

  const proposalsQuery = useQuery({
    queryKey: ['proposals', ticketId],
    queryFn: () => apiGet<Proposal[]>(`/tickets/${ticketId}/proposals`)
  });

  const createProposal = useMutation({
    mutationFn: () =>
      apiPost(`/tickets/${ticketId}/proposals`, {
        message,
        estimatedValue: estimatedValue ? Number(estimatedValue) : undefined
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', ticketId] })
  });

  const acceptProposal = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/accept`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', ticketId] })
  });

  const rejectProposal = useMutation({
    mutationFn: (proposalId: string) => apiPost(`/proposals/${proposalId}/reject`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals', ticketId] })
  });

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">Propostas da Solicitação</h1>

      <section className="glass-card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Enviar proposta</h2>
        <input
          className="rounded-xl border border-white/10 bg-slate-900/60 p-3"
          placeholder="Valor estimado"
          value={estimatedValue}
          onChange={(e) => setEstimatedValue(e.target.value)}
        />
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

      <section className="grid gap-4 md:grid-cols-2">
        {proposalsQuery.data?.map((proposal) => (
          <article key={proposal.id} className="glass-card p-4">
            <p className="font-semibold">
              {proposal.provider.name} <span className="text-slate-400">({proposal.provider.userType})</span>
            </p>
            
            <div className="flex flex-wrap gap-1 mt-1">
               {proposal.provider.specialties?.map(s => (
                 <span key={s} className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">
                   {s}
                 </span>
               ))}
            </div>

            <p className="mt-3 text-sm text-slate-300">{proposal.message}</p>
            
            {proposal.provider.certificates?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">📜 Estante da Credibilidade</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {proposal.provider.certificates.map((cert, i) => (
                    <img key={i} src={cert} alt="Certificado" className="h-10 w-14 object-cover rounded border border-white/10 flex-shrink-0" />
                  ))}
                </div>
              </div>
            )}

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
