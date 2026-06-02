'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Mail, MessageCircle, Phone, Globe, ChevronRight } from 'lucide-react';

const faqs = [
  {
    q: "Como funciona a garantia do serviço?",
    a: "O TechFix é um marketplace de intermediação. A garantia deve ser negociada diretamente com o prestador. Recomendamos sempre solicitar a Nota Fiscal do serviço realizado."
  },
  {
    q: "Como os técnicos são verificados?",
    a: "Técnicos podem subir certificados na 'Estante da Credibilidade'. Além disso, o sistema de avaliações (estrelas) permite que a comunidade identifique os melhores profissionais."
  },
  {
    q: "É seguro pagar pela plataforma?",
    a: "Usamos Stripe e Mercado Pago, líderes mundiais em segurança. Seus dados de cartão nunca ficam salvos em nossos servidores."
  },
  {
    q: "O que fazer em caso de disputa?",
    a: "Você pode abrir um chamado de disputa no detalhe do serviço. Nossa equipe de moderação irá analisar o caso para ajudar na mediação."
  }
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold italic">Central de <span className="text-cyan-400">Ajuda</span></h1>
        <p className="text-slate-400">Tire suas dúvidas e entre em contato com nosso time de suporte.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {[
          { icon: <Mail />, label: 'E-mail', val: 'suporte@techfix.com.br' },
          { icon: <MessageCircle />, label: 'WhatsApp', val: '(11) 99999-9999' },
          { icon: <Globe />, label: 'Ouvidoria', val: '0800-000-0000' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 text-center space-y-3">
             <div className="mx-auto h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                {item.icon}
             </div>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
             <p className="text-sm font-medium">{item.val}</p>
          </div>
        ))}
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="text-cyan-400" /> Perguntas Frequentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.details 
              key={idx}
              className="glass-card group cursor-pointer"
            >
              <summary className="flex items-center justify-between p-6 list-none font-bold text-white group-open:pb-2 transition-all">
                {faq.q}
                <ChevronRight size={18} className="text-slate-500 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed">
                {faq.a}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      <section className="mt-16 glass-card p-8 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border-cyan-500/20 text-center">
        <h3 className="text-xl font-bold mb-2">Ainda precisa de ajuda?</h3>
        <p className="text-sm text-slate-400 mb-6 font-medium">Nosso time técnico está disponível de Segunda a Sexta, das 08h às 18h.</p>
        <button className="rounded-xl bg-cyan-600 px-8 py-3 font-bold text-white hover:bg-cyan-500 transition-all">
          Abrir Ticket de Suporte
        </button>
      </section>
    </main>
  );
}
