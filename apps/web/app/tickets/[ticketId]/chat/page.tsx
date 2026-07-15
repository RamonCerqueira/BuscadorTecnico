'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, use, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';
import {
  Send,
  ChevronLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  ShieldCheck,
  Building2,
  User,
  Info,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

type TicketMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; userType: string };
};

export default function TicketChatPage({ params: paramsPromise }: { params: Promise<{ ticketId: string }> }) {
  const params = use(paramsPromise);
  const ticketId = params.ticketId;
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch logged-in user profile
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<any>('/users/me'),
  });

  // Fetch ticket details
  const ticketQuery = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => apiGet<any>(`/tickets/${ticketId}`),
  });

  // Fetch message log
  const messagesQuery = useQuery({
    queryKey: ['messages', ticketId],
    queryFn: () => apiGet<TicketMessage[]>(`/tickets/${ticketId}/messages`),
    refetchInterval: 3000, // Poll messages every 3s for simple real-time
  });

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesQuery.data]);

  const sendMutation = useMutation({
    mutationFn: () => apiPost(`/tickets/${ticketId}/messages`, { content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', ticketId] });
      setTimeout(scrollToBottom, 50);
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) sendMutation.mutate();
    }
  };

  const handleSend = () => {
    if (content.trim()) sendMutation.mutate();
  };

  // Identify recipient user
  const ticket = ticketQuery.data;
  const me = meQuery.data;

  let partnerName = 'Carregando...';
  let partnerAvatar = '';
  let partnerType = '';

  if (ticket && me) {
    if (me.id === ticket.clientId) {
      partnerName = ticket.assignedTo?.name || 'Técnico Geral';
      partnerAvatar = ticket.assignedTo?.avatarUrl || '';
      partnerType = ticket.assignedTo?.userType || 'technician';
    } else {
      partnerName = ticket.client?.name || 'Cliente';
      partnerAvatar = ticket.client?.avatarUrl || '';
      partnerType = 'client';
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#07070a] text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-0 md:py-6 md:px-4">
      <div className="w-full max-w-5xl h-screen md:h-[85vh] bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between relative">
        
        {/* WhatsApp-Style Chat Header */}
        <header className="px-4 py-3 bg-zinc-100 dark:bg-[#0f0f12] border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="h-9 w-9 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>

            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-850 overflow-hidden flex items-center justify-center border border-zinc-350 dark:border-zinc-800">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} className="h-full w-full object-cover" />
                ) : partnerType === 'company' ? (
                  <Building2 size={16} className="text-zinc-500" />
                ) : (
                  <User size={16} className="text-zinc-500" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f0f12]" />
            </div>

            <div className="text-left">
              <h1 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                {partnerName}
                {partnerType !== 'client' && <ShieldCheck size={13} className="text-indigo-500" />}
              </h1>
              <span className="text-[10px] text-emerald-500 font-semibold block">Online</span>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-3 text-zinc-400">
            <button className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800/50 flex items-center justify-center transition-colors">
              <Phone size={16} />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800/50 flex items-center justify-center transition-colors">
              <Video size={16} />
            </button>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <button className="h-8 w-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800/50 flex items-center justify-center transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {/* Floating Ticket Details Bar */}
        {ticket && (
          <div className="bg-indigo-500/[0.03] border-b border-zinc-200 dark:border-zinc-800/40 px-5 py-2.5 flex items-center justify-between text-left shrink-0">
            <div className="flex items-center gap-2">
              <Info size={13} className="text-indigo-500 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Demanda:</span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-1">
                {ticket.title}
              </span>
            </div>
            <Link
              href={`/tickets/${ticket.id}`}
              className="text-[10px] font-bold text-indigo-550 dark:text-indigo-400 hover:underline flex items-center gap-0.5 uppercase tracking-wider shrink-0"
            >
              Ver Chamado <ExternalLink size={10} />
            </Link>
          </div>
        )}

        {/* Scrollable conversation bubble pane */}
        <section
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50 dark:bg-[#07070a]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        >
          {messagesQuery.data?.length ? (
            messagesQuery.data.map((message) => {
              const isMyMessage = me && message.sender.id === me.id;
              const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <article
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-left shadow-sm ${
                      isMyMessage
                        ? 'bg-indigo-650 text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#121216] border border-zinc-200 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-100 rounded-tl-none'
                    }`}
                  >
                    {!isMyMessage && (
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block mb-0.5">
                        {message.sender.name}
                      </span>
                    )}
                    <p className="text-xs sm:text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-60">
                      <span>{messageTime}</span>
                      {isMyMessage && (
                        <span className="text-emerald-450 text-[10px]" title="Enviado">
                          ✓✓
                        </span>
                      )}
                    </div>
                  </article>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <MessageSquare size={36} className="text-zinc-650 mb-3" />
              <p className="text-xs font-semibold uppercase tracking-wider">Aguardando mensagens...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>

        {/* WhatsApp-Style bottom input keyboard area */}
        <footer className="p-3 bg-zinc-100 dark:bg-[#0f0f12] border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-2.5 shrink-0">
          <button className="h-10 w-10 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-450 flex items-center justify-center shrink-0 transition-colors">
            <Smile size={20} />
          </button>
          <button className="h-10 w-10 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-450 flex items-center justify-center shrink-0 transition-colors">
            <Paperclip size={20} />
          </button>

          <input
            className="flex-1 h-11 bg-white dark:bg-[#15151a] border border-zinc-250 dark:border-zinc-800 rounded-full px-5 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none placeholder:text-zinc-450 focus:border-indigo-500/50"
            placeholder="Escreva uma mensagem..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSend}
            disabled={sendMutation.isPending || !content.trim()}
            className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 active:scale-95 transition-all shrink-0 disabled:opacity-50 disabled:scale-100"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </footer>
      </div>
    </main>
  );
}
