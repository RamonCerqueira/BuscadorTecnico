'use client';

import Link from 'next/link';
import { ShieldCheck, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/40 bg-zinc-50 dark:bg-[#07070a] py-16 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link
              href="/"
              className="flex items-center gap-3 font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              <div className="h-7 w-7 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-sm">
                <svg
                  className="h-4 w-4 text-white dark:text-black"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-bold">
                Tech
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  Fix
                </span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              O maior ecossistema de serviços gerais e especializados da América Latina. Segurança,
              rapidez e qualidade garantida em cada detalhe.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-6">
              Plataforma
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/about"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Oportunidades
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-diagnostic"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Diagnóstico IA
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-6">
              Conta
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/register"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Seja um Prestador
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Acessar Painel
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-6">
              Jurídico
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <Link
                  href="/legal"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Privacidade
                </Link>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/[0.04] dark:bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  <ShieldCheck size={12} /> Dados Protegidos pela LGPD
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1.5">
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} TechFix Intermediação de Serviços LTDA.
            </p>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
              CNPJ: 00.000.000/0001-00 | Av. Paulista, 1000 - São Paulo, SP
            </p>
          </div>

          <div className="flex items-center gap-6 text-zinc-400 dark:text-zinc-500">
            <Link
              href="#"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </Link>
            <Link
              href="#"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </Link>
            <Link
              href="#"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              <Mail size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
