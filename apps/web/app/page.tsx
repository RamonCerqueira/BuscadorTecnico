import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6">
      <p className="text-sm uppercase tracking-wide text-blue-400">Nova stack</p>
      <h1 className="text-4xl font-bold">Buscador Técnico em Next.js (App Router)</h1>
      <p className="text-slate-300">
        Base inicial pronta com React + TypeScript + Tailwind + Radix, Zustand e React Query.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/marketplace">Explorar Marketplace</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </main>
  );
}
