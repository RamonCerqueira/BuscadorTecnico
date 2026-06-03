'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Building2, User } from 'lucide-react';
import { useSessionStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const { userType } = useSessionStore();
  const router = useRouter();

  const plans = [
    {
      id: 'tech',
      name: 'Plano Técnico',
      price: '29,90',
      description: 'Ideal para profissionais autônomos.',
      icon: <User className="text-cyan-400" size={32} />,
      features: [
        'Acesso ilimitado ao Marketplace',
        'Envio de propostas sem taxas',
        'Selo de Profissional Verificado',
        'Estante da Credibilidade ilimitada',
        'Chat em tempo real com clientes'
      ],
      popular: userType === 'technician'
    },
    {
      id: 'company',
      name: 'Plano Empresa',
      price: '89,90',
      description: 'Para empresas com múltiplos técnicos.',
      icon: <Building2 className="text-blue-400" size={32} />,
      features: [
        'Tudo do plano Técnico',
        'Destaque nas buscas por região',
        'Dashboard de ganhos avançado',
        'Suporte prioritário 24/7',
        'Relatórios de desempenho mensais'
      ],
      popular: userType === 'company'
    }
  ];

  const handleSubscribe = async (planId: string, gateway: 'stripe' | 'mercadopago') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
        },
        body: JSON.stringify({ planId, gateway })
      });
      
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="text-center mb-16 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl"
        >
          Escolha o seu <span className="text-cyan-400">Plano de Acesso</span>
        </motion.h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Tenha acesso exclusivo aos melhores chamados da sua região e aumente seu faturamento mensal com a TechFix.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-8 flex flex-col relative ${
              plan.popular ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : ''
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Recomendado para você
              </span>
            )}
            
            <div className="mb-6">{plan.icon}</div>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-slate-400 text-sm mt-2">{plan.description}</p>
            
            <div className="my-8">
              <span className="text-4xl font-bold italic">R$ {plan.price}</span>
              <span className="text-slate-500">/mês</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map(feat => (
                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="rounded-full bg-cyan-500/20 p-1 text-cyan-400">
                    <Check size={12} />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSubscribe(plan.id, 'stripe')}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Pagar com Cartão
              </button>
              <button
                onClick={() => handleSubscribe(plan.id, 'mercadopago')}
                className="w-full py-3 rounded-xl font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20 transition-all"
              >
                Pagar com PIX
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-slate-500">
        Pagamento seguro e criptografado. Cancele a qualquer momento sem taxas de fidelidade.
      </p>
    </main>
  );
}
