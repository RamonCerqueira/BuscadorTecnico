import Link from 'next/link';
import { apiGet } from '@/lib/api/client';

type Ticket = {
  id: string;
  title: string;
  description: string;
  locationText: string;
  status: string;
  client?: { name: string };
};

export default async function MarketplacePage() {
  const tickets = await apiGet<Ticket[]>('/marketplace/tickets');

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold">Marketplace de Solicitações</h1>
        <p className="text-slate-300">Veja oportunidades abertas e envie orçamento em poucos cliques.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="glass-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                {ticket.status}
              </span>
              <span className="text-xs text-slate-400">{ticket.client?.name ?? 'Cliente'}</span>
            </div>

            <h2 className="text-lg font-semibold">{ticket.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm text-slate-300">{ticket.description}</p>
            <p className="mt-3 text-xs text-slate-400">{ticket.locationText}</p>

            <div className="mt-4 flex gap-3">
              <Link
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-500"
                href={`/tickets/${ticket.id}/proposals`}
              >
                Enviar proposta
              </Link>
              <Link
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
                href={`/tickets/${ticket.id}/chat`}
              >
                Abrir chat
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
