import Link from 'next/link';

const links = [
  { href: '/', label: 'Início' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/login', label: 'Entrar' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight text-white">
          Buscador <span className="text-cyan-400">Técnico</span>
        </Link>

        <nav className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
