'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSessionStore } from '@/lib/store';
import { Search, MapPin, Briefcase, ArrowUpRight } from 'lucide-react';
import { Ticket } from '@/types/ticket';

const InteractiveMap = dynamic(() => import('@/components/ui/interactive-map'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2rem]" />
});

export default function MarketplacePage() {
  const { token } = useSessionStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const ticketsQuery = useQuery({
    queryKey: ['marketplace-tickets'],
    queryFn: () => apiGet<{ data: Ticket[] }>('/marketplace/tickets')
  });

  const tickets = (ticketsQuery.data?.data ?? []).filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.locationText || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !selectedCategory || 
      t.title.toLowerCase().includes(selectedCategory.toLowerCase()) || 
      (t.description || '').toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const markers = tickets
    .filter(t => t.latitude && t.longitude)
    .map(t => ({ id: t.id, title: t.title, lat: t.latitude!, lng: t.longitude! }));

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-7xl px-4 py-12 sm:px-6 text-slate-900 dark:text-white transition-colors duration-300">
      <header className="mb-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Feed Profissional</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Encontre sua próxima <span className="premium-gradient-text">Oportunidade</span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Seja bem-vindo ao hub de chamados da TechFix. Aqui você encontra clientes reais precisando da sua expertise agora mesmo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-3xl group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input
              className="input-field pl-14 h-16 text-xl shadow-2xl shadow-blue-500/5"
              placeholder="Ex: Encanador, Ar condicionado, Pintura..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </motion.div>
      </header>

      {markers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl shadow-blue-500/5 bg-slate-100 dark:bg-white/5"
        >
          <InteractiveMap tickets={markers} />
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <h2 className="text-2xl font-black tracking-tight">Chamados <span className="text-blue-600">Disponíveis</span></h2>
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Ar Condicionado', 'Elétrica', 'Hidráulica', 'Informática', 'Reformas'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedCategory(f === 'Todos' ? null : f)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${(!selectedCategory && f === 'Todos') || selectedCategory === f ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {ticketsQuery.isLoading && (
          <div className="col-span-full py-32 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-xl shadow-blue-600/20"></div>
            <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-xs">Sincronizando Marketplace...</p>
          </div>
        )}

        {tickets.length === 0 && !ticketsQuery.isLoading && (
          <div className="col-span-full py-32 text-center glass-card border-dashed flex flex-col items-center gap-4">
            <Search size={48} className="text-slate-200 dark:text-white/10" />
            <p className="text-slate-400 font-bold">Nenhum chamado encontrado para "{search}"</p>
          </div>
        )}

        {tickets.map((ticket, idx) => (
          <motion.article
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card flex flex-col p-10 group"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                {ticket.status === 'open' ? 'Disponível' : 'Em Análise'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">{ticket.title}</h2>
            <p className="mt-4 line-clamp-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{ticket.description}</p>

            <div className="mt-auto pt-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <MapPin size={18} className="text-blue-500" /> {ticket.locationText}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <Briefcase size={18} className="text-slate-400" /> {ticket.client?.name ?? 'Cliente Premium'}
              </div>
            </div>

            <Link
              href={`/tickets/${ticket.id}`}
              className="btn-primary mt-4 w-full py-4 text-xs uppercase tracking-[0.2em] shadow-blue-600/10 flex items-center justify-center gap-2"
            >
              Detalhes do Chamado <ArrowUpRight size={16} />
            </Link>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
