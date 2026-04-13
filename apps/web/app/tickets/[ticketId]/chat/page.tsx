'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type TicketMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; userType: string };
};

export default function TicketChatPage({ params }: { params: { ticketId: string } }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const messagesQuery = useQuery({
    queryKey: ['messages', params.ticketId],
    queryFn: () => apiGet<TicketMessage[]>(`/tickets/${params.ticketId}/messages`)
  });

  const sendMutation = useMutation({
    mutationFn: () => apiPost(`/tickets/${params.ticketId}/messages`, { content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', params.ticketId] });
    }
  });

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-3xl font-semibold">Chat da Solicitação</h1>

      <section className="glass-card mb-4 max-h-[380px] space-y-3 overflow-y-auto p-4">
        {messagesQuery.data?.length ? (
          messagesQuery.data.map((message) => (
            <article key={message.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <p className="text-xs text-slate-400">
                {message.sender.name} ({message.sender.userType})
              </p>
              <p className="mt-1">{message.content}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">Nenhuma mensagem ainda.</p>
        )}
      </section>

      <section className="glass-card space-y-3 p-4">
        <textarea
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 p-3"
          placeholder="Digite sua mensagem"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="rounded-xl bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-500"
          onClick={() => sendMutation.mutate()}
        >
          {sendMutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
        </button>
      </section>
    </main>
  );
}
