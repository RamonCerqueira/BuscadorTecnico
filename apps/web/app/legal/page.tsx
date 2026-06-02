'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Scale, Lock, Info } from 'lucide-react';

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-extrabold">Documentação <span className="text-cyan-400">Jurídica</span></h1>
        <p className="text-slate-400">Transparência e segurança para todos os usuários da plataforma TechFix.</p>
      </div>

      <div className="space-y-12">
        {/* Termos de Uso */}
        <section id="terms" className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-cyan-400 border-b border-white/5 pb-4">
            <Scale size={24} />
            <h2 className="text-2xl font-bold italic">Termos de Uso</h2>
          </div>
          
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p className="font-bold text-white">1. Natureza do Serviço</p>
            <p>O TechFix é uma plataforma tecnológica que atua exclusivamente como **INTERMEDIADORA** entre Clientes e Prestadores de Serviço (Técnicos e Empresas). Não possuímos vínculo empregatício com nenhum prestador cadastrado.</p>
            
            <p className="font-bold text-white">2. Limitação de Responsabilidade</p>
            <p>A plataforma não se responsabiliza pela qualidade, segurança ou legalidade dos serviços prestados. A negociação de valores, prazos e a execução do trabalho são de inteira responsabilidade das partes envolvidas.</p>

            <p className="font-bold text-white">3. Estante da Credibilidade</p>
            <p>Os certificados exibidos são de responsabilidade dos prestadores. Recomendamos que o cliente sempre verifique a validade de documentos críticos antes de autorizar serviços de alto risco.</p>

            <p className="font-bold text-white">4. Pagamentos e Assinaturas</p>
            <p>O pagamento de assinaturas garante o acesso à tecnologia do marketplace. Em nenhuma hipótese o pagamento da assinatura configura garantia de recebimento de chamados ou lucro por parte do prestador.</p>
          </div>
        </section>

        {/* Disclaimer de IA */}
        <section id="ai-disclaimer" className="glass-card p-8 space-y-6 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-center gap-3 text-purple-400 border-b border-white/5 pb-4">
            <Info size={24} />
            <h2 className="text-2xl font-bold italic">Aviso Legal de Inteligência Artificial</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>O "Assistente de Diagnóstico IA" utiliza a tecnologia Google Gemini Pro para fornecer sugestões baseadas em descrições de texto. </p>
            <p className="bg-purple-500/20 p-4 rounded-xl text-purple-200 border border-purple-500/30">
              **IMPORTANTE:** A análise gerada pela IA NÃO substitui a avaliação física de um profissional humano qualificado. O TechFix não se responsabiliza por compras de peças ou intervenções feitas baseadas exclusivamente na análise da IA.
            </p>
          </div>
        </section>

        {/* Política de Privacidade */}
        <section id="privacy" className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-emerald-400 border-b border-white/5 pb-4">
            <Lock size={24} />
            <h2 className="text-2xl font-bold italic">Política de Privacidade (LGPD)</h2>
          </div>
          <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), o TechFix coleta apenas os dados estritamente necessários para o funcionamento do marketplace (Nome, E-mail, Telefone e Localização).</p>
            <p>Seus dados de localização são utilizados apenas para filtrar técnicos próximos e nunca são vendidos para terceiros. Você pode solicitar a exclusão de sua conta e dados a qualquer momento através do suporte.</p>
          </div>
        </section>
      </div>

      <footer className="mt-20 text-center text-xs text-slate-500">
        Última atualização: {new Date().toLocaleDateString('pt-BR')}
      </footer>
    </main>
  );
}
