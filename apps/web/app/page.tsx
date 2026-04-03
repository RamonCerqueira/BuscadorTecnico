import { Button } from '@/components/ui/button';
import Link from 'next/link';

const highlights = [
  { title: 'Tempo de resposta', value: '< 15 min' },
  { title: 'Técnicos e empresas', value: '+1.200' },
  { title: 'Chamados resolvidos', value: '+42 mil' }
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14 sm:px-6">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-cyan-300">
            Produto 2026 • UI/UX Moderno
          </p>

          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            O marketplace técnico mais rápido para conectar <span className="text-cyan-300">clientes</span>,
            <span className="text-blue-300"> técnicos</span> e <span className="text-emerald-300">empresas</span>.
          </h1>

          <p className="max-w-2xl text-lg text-slate-300">
            Publique solicitações, receba orçamentos, converse em tempo real e feche serviços com segurança.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 px-6 text-sm">
              <Link href="/marketplace">Explorar marketplace</Link>
            </Button>
            <Button variant="outline" asChild className="h-11 px-6 text-sm">
              <Link href="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <p className="mb-4 text-sm text-slate-300">Indicadores da operação</p>
          <div className="grid gap-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.title}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
