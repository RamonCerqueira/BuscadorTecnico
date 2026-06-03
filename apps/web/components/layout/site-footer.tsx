'use client';

import Link from 'next/link';
import { ShieldCheck, Mail, Globe } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a] py-12 md:py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 mb-12 md:mb-16">
          {/* Brand */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 dark:text-white">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white">TF</div>
              <span>Tech<span className="text-blue-600">Fix</span></span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              O maior ecossistema de serviços gerais e especializados da América Latina. Segurança, rapidez e qualidade garantida em cada detalhe.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Plataforma</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/about" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Quem Somos</Link></li>
              <li><Link href="/opportunities" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Oportunidades</Link></li>
              <li><Link href="/ai-diagnostic" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Diagnóstico IA</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Conta</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/register" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Seja um Prestador</Link></li>
              <li><Link href="/login" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Acessar Painel</Link></li>
              <li><Link href="/help" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Central de Ajuda</Link></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Jurídico</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/legal" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Termos de Uso</Link></li>
              <li><Link href="/legal" className="text-slate-500 hover:text-blue-600 dark:hover:text-white">Privacidade</Link></li>
              <li className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest pt-2">
                 <ShieldCheck size={14} /> Dados Protegidos pela LGPD
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="text-center md:text-left space-y-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
               © 2026 TechFix Intermediação de Serviços LTDA.
            </p>
            <p className="text-[10px] text-slate-400">
              CNPJ: 00.000.000/0001-00 | Av. Paulista, 1000 - São Paulo, SP
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-slate-400">
             <Link href="#" className="hover:text-blue-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
             </Link>
             <Link href="#" className="hover:text-blue-600 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
             </Link>
             <Link href="#" className="hover:text-blue-600 transition-colors">
                <Mail size={20} strokeWidth={2.5} />
             </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
