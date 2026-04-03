import Link from 'next/link';
import { apiGet } from '@/lib/api/client';

type Ticket = {
  id: string;
  title: string;
  description: string;
  locationText: string;
  status: string;
};

export default async function MarketplacePage() {
  const tickets = await apiGet<Ticket[]>('/marketplace/tickets');

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-bold">Marketplace de Solicitações</h1>
      <p className="text-slate-300">Solicitações abertas para técnicos e empresas.</p>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-lg border border-slate-800 p-4">
            <h2 className="font-semibold">{ticket.title}</h2>
            <p className="text-sm text-slate-300">{ticket.description}</p>
            <p className="mt-2 text-xs text-slate-400">{ticket.locationText}</p>
            <Link
              className="mt-3 inline-block text-sm text-blue-400 hover:text-blue-300"
              href={`/tickets/${ticket.id}/proposals`}
            >
              Ver propostas
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
