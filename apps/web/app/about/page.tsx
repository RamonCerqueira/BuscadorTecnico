'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
  Lightbulb,
  Search,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="flex flex-col bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300 min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative py-24 lg:py-40 overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

        <div className="container mx-auto px-4 relative z-20">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 backdrop-blur-md px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400"
            >
              <Star size={16} className="fill-current" /> MANIFESTO TECHFIX
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-10 md:p-16 rounded-[3rem] border border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
            >
              <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-8xl leading-[1]">
                A elite dos serviços está no <span className="premium-gradient-text">TechFix.</span>
              </h1>
              <p className="mt-10 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Nossa missão é transformar a forma como você contrata e presta serviços técnicos.
                Conectamos os melhores especialistas com tecnologia de ponta e confiança inabalável.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: 'Profissionais de Elite', value: '+15k' },
              { label: 'Serviços com Garantia', value: '50k+' },
              { label: 'NPS da Plataforma', value: '4.9/5' },
              { label: 'Capilaridade Nacional', value: 'Brasil' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-20 leading-tight">Especialistas para <br /><span className="text-blue-600">cada detalhe.</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: 'Hidráulica', icon: <Wrench /> },
              { label: 'Elétrica', icon: <Zap /> },
              { label: 'Climatização', icon: <Lightbulb /> },
              { label: 'Mecânica', icon: <Search /> },
              { label: 'Informática', icon: <Users /> },
              { label: 'Construção', icon: <ShieldCheck /> },
            ].map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group glass-card p-10 flex flex-col items-center justify-center gap-6 text-center border-slate-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="h-20 w-20 rounded-[2rem] bg-blue-600/5 dark:bg-blue-600/10 text-blue-600 dark:text-blue-500 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-blue-600/30">
                  {cat.icon}
                </div>
                <span className="font-black text-xs uppercase tracking-widest">{cat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification CTA */}
      <section className="py-24 px-4 mb-20">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>

          <div className="relative z-10 space-y-10">
            <div className="mx-auto h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-blue-600 shadow-2xl flex">
              <ShieldCheck size={48} />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">Qualidade que você <br />pode confiar.</h2>
              <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
                No TechFix, todos os profissionais passam por uma verificação rigorosa antes de serem liberados para atuar no marketplace.
              </p>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/register" className="bg-white text-blue-600 font-black px-12 py-5 rounded-2xl text-lg shadow-2xl hover:bg-slate-50 active:scale-95 transition-all">
                Seja um Prestador
              </Link>
              <Link href="/marketplace" className="bg-transparent border-2 border-white/30 text-white font-black px-12 py-5 rounded-2xl text-lg shadow-2xl hover:bg-white/10 active:scale-95 transition-all backdrop-blur-md">
                Encontrar um Técnico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
