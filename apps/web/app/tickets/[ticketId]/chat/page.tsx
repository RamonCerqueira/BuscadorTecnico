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
  const [senderId, setSenderId] = useState('');
  const [content, setContent] = useState('');

  const messagesQuery = useQuery({
    queryKey: ['messages', params.ticketId],
    queryFn: () => apiGet<TicketMessage[]>(`/tickets/${params.ticketId}/messages`)
  });

  const sendMutation = useMutation({
    mutationFn: () => apiPost(`/tickets/${params.ticketId}/messages`, { senderId, content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', params.ticketId] });
    }
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-bold">Chat da Solicitação</h1>
      <div className="space-y-2 rounded border border-slate-800 p-4">
        {messagesQuery.data?.map((message) => (
          <article key={message.id} className="rounded bg-slate-900 p-3">
            <p className="text-xs text-slate-400">{message.sender.name} ({message.sender.userType})</p>
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <input
        className="w-full rounded bg-slate-900 p-2"
        placeholder="Seu ID de usuário"
        value={senderId}
        onChange={(e) => setSenderId(e.target.value)}
      />
      <textarea
        className="w-full rounded bg-slate-900 p-2"
        placeholder="Digite sua mensagem"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="rounded bg-blue-600 px-4 py-2" onClick={() => sendMutation.mutate()}>
        Enviar mensagem
      </button>
    </main>
  );
}
