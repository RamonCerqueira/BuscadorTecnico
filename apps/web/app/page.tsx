'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase
} from 'lucide-react';

const MOCK_COMPANIES = [
  { id: 1, name: 'ElectroFix Ltda', rating: 4.8, reviews: 124, category: 'Elétrica', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop' },
  { id: 2, name: 'HidroPrime Soluções', rating: 4.5, reviews: 89, category: 'Hidráulica', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, name: 'ClimaBom Ar Condicionado', rating: 4.9, reviews: 256, category: 'Climatização', image: 'https://images.unsplash.com/photo-1599427303058-f06cb9e1307b?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, name: 'InforTech Serviços', rating: 4.7, reviews: 67, category: 'Informática', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop' },
];

const MOCK_CHATS = [
  {
    id: 1,
    title: "Reparo Residencial Urgente",
    participants: "Cliente • Técnico",
    messages: [
      { sender: "client", text: "Oi! Meu ar parou de gelar do nada e tá vazando água 😭", time: "14:20" },
      { sender: "tech", text: "Olá! Aceitei o chamado. Chego aí em 15 min, estou no seu bairro.", time: "14:22" },
      { sender: "client", text: "Problema resolvido muito rápido! Serviço nota 1000. 🌟", time: "15:10" }
    ]
  },
  {
    id: 2,
    title: "Terceirização B2B",
    participants: "Construtora • Eletricista",
    messages: [
      { sender: "client", text: "Precisamos de um eletricista pra finalizar a fiação da obra hoje.", time: "08:00" },
      { sender: "tech", text: "Bom dia! Estou com equipe disponível. Pagamento pelo app?", time: "08:05" },
      { sender: "client", text: "Sim, valor já está seguro na plataforma. Podem vir!", time: "08:06" }
    ]
  },
  {
    id: 3,
    title: "Manutenção Predial",
    participants: "Síndico • Empresa",
    messages: [
      { sender: "client", text: "Cotação para limpeza das caixas d'água neste sábado.", time: "10:00" },
      { sender: "tech", text: "Agendado via TechFix! Nossa equipe estará aí às 08h.", time: "10:15" },
      { sender: "tech", text: "Finalizado. Fotos e laudo técnico enviados no chamado. ✅", time: "11:45" }
    ]
  }
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Marquee needs no interval state


  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Search Hero Section - Ultra Clean */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              O que você precisa <span className="text-blue-600">consertar</span> hoje?
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium">
              Encontre os melhores técnicos e empresas em segundos.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative group max-w-2xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex flex-col sm:flex-row items-center bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl gap-2 sm:gap-0">
              <div className="hidden sm:block pl-4 text-slate-400">
                <Search size={24} />
              </div>
              <input 
                type="text" 
                placeholder="Ex: Ar condicionado, Eletricista..."
                className="w-full sm:flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 sm:py-4 text-base sm:text-lg font-medium outline-none text-center sm:text-left"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/25">
                Buscar
              </button>
            </div>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {['Ar Condicionado', 'Elétrica', 'Hidráulica', 'Limpeza', 'Reformas'].map((cat) => (
              <button key={cat} className="px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies - Random Grid */}
      <section className="py-20 bg-slate-50/50 dark:bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black">Empresas em <span className="text-blue-600">Destaque</span></h2>
            <Link href="/companies" className="text-sm font-black text-blue-600 flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_COMPANIES.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={company.image} alt={company.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5 dark:border-white/10">
                      {company.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{company.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={16} className="fill-current" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">{company.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6">
                    <span className="flex items-center gap-1"><Users size={14} /> {company.reviews} avaliações</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Verificada</span>
                  </div>
                  <button className="w-full bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600 group-hover:text-white py-3 rounded-xl text-sm font-black transition-all">
                    Ver Perfil
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Efficiency Section */}
      <section 
        className="relative py-32 bg-fixed bg-cover bg-center overflow-hidden" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-blue-900/80 mix-blend-multiply z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent z-0 h-32"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Eficiência em <span className="text-cyan-400">Escala</span>
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">
              Nosso sistema trabalha incansavelmente nos bastidores para garantir que sua experiência seja impecável.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { label: 'Profissionais Ativos', value: '15k+' },
              { label: 'Tempo Médio de Match', value: '1.2 min' },
              { label: 'Serviços Concluídos', value: '250k' },
              { label: 'Satisfação Média', value: '4.9/5' },
            ].map((metric, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card !bg-white/10 !border-white/20 p-6 sm:p-8 backdrop-blur-md"
              >
                <div className="text-3xl sm:text-5xl font-black text-white mb-2">{metric.value}</div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-blue-200">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Chat-style Testimonials */}
      <section className="py-24 sm:py-32 bg-slate-50 dark:bg-[#050505]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              A conexão que <span className="text-blue-600">resolve</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              Veja como o TechFix facilita o diálogo entre quem precisa de ajuda e quem sabe resolver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {MOCK_CHATS.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col h-full bg-white dark:bg-[#111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-blue-900/5 overflow-hidden"
              >
                {/* Chat Header */}
                <div className="bg-slate-100 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-2 border-white dark:border-[#111]">
                         <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">CL</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-white dark:border-[#111]">
                         <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">PR</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{chat.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.participants}</p>
                    </div>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="p-6 flex-1 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed dark:opacity-20 opacity-[0.03]">
                  {chat.messages.map((msg, i) => {
                    const isClient = msg.sender === 'client';
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9, x: isClient ? -20 : 20 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + (i * 0.2), type: "spring", stiffness: 200 }}
                        className={`flex flex-col max-w-[85%] ${isClient ? 'self-start' : 'self-end'}`}
                      >
                        <div 
                          className={`px-4 py-3 text-sm shadow-sm
                            ${isClient 
                              ? 'bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-white/5' 
                              : 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                            }
                          `}
                        >
                          {msg.text}
                        </div>
                        <span className={`text-[10px] font-bold text-slate-400 mt-1 ${isClient ? 'ml-1' : 'text-right mr-1'}`}>
                          {msg.time} {msg.sender === 'tech' && <span className="text-blue-500 inline-block ml-1">✓✓</span>}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
