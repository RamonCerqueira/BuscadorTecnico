import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PublicFaqAccordion({ faqs }: { faqs: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="glass-card p-6 md:p-8 border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111119]">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
        <HelpCircle size={16} className="text-amber-500" /> Dúvidas Frequentes (FAQ)
      </h3>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div 
              key={faq.id} 
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen 
                  ? 'border-amber-500/30 bg-amber-500/5' 
                  : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <button 
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <h4 className={`text-sm font-bold pr-4 transition-colors ${isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {faq.question}
                </h4>
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-amber-500/10">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
