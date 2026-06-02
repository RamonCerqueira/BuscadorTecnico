'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, ArrowRight, ClipboardList } from 'lucide-react';
import { apiPost } from '@/lib/api/client';
import Link from 'next/link';

export default function AiDiagnosticPage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState<string | null>(null);

  const handleAnalise = async () => {
    if (!description || description.length < 10) return;
    setLoading(true);
    try {
      // Endpoint que chama o Gemini no backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/diagnostic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
        },
        body: JSON.stringify({ description })
      });
      const data = await res.json();
      setDiagnostic(data.result);
    } catch (error) {
       console.error(error);
       setDiagnostic("Ocorreu um erro na análise, mas você ainda pode abrir o chamado abaixo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="text-center mb-12 space-y-4">
        <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-cyan-500/10 text-cyan-400 mb-4"
        >
          <Bot size={32} />
        </motion.div>
        <h1 className="text-3xl font-bold">Assistente de IA TechFix</h1>
        <p className="text-slate-400">Descreva o problema e nossa IA dirá o que pode ser antes de você contratar o técnico.</p>
      </header>

      <div className="space-y-6">
        <div className="glass-card p-6 space-y-4">
           <label className="text-sm font-medium text-slate-300">O que está acontecendo?</label>
           <textarea 
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-white focus:border-cyan-500/50 outline-none"
              placeholder="Ex: Minha geladeira parou de gelar na parte de baixo mas o freezer continua funcionando..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
           />
           <button
              onClick={handleAnalise}
              disabled={loading || description.length < 10}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-4 font-bold text-white hover:bg-cyan-500 transition-all disabled:opacity-50"
           >
             {loading ? 'Analisando com Gemini Pro...' : (
               <>
                 Analisar Problema com IA <Sparkles size={18} />
               </>
             )}
           </button>
        </div>

        <AnimatePresence>
          {diagnostic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-cyan-500/30 bg-cyan-500/5"
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-cyan-400">
                <Sparkles size={20} /> Resultado da Análise
              </h3>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {diagnostic}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-xs text-slate-500 mb-4 italic text-center">Tudo certo? Agora publique seu chamado para receber orçamentos de profissionais reais.</p>
                 <Link 
                    href={`/tickets/new?desc=${encodeURIComponent(description)}&diagnostic=${encodeURIComponent(diagnostic)}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-white text-slate-900 py-3 font-bold hover:bg-slate-200 transition-all"
                 >
                    Criar Chamado Baseado nesta Análise <ArrowRight size={18} />
                 </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
