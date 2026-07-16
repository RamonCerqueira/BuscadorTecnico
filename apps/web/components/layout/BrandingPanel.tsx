'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Star, 
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Scissors,
  Laptop,
  Sparkles,
  Wrench,
  Hammer,
  Clock
} from 'lucide-react';
import { UserType } from '@/app/register/components/RoleSelector';

interface BrandingPanelProps {
  userType: UserType;
}

interface ProviderSlide {
  id: string;
  name: string;
  category: string;
  role: string;
  rating: number;
  reviewsCount: number;
  description: string;
  imageUrl: string;
  status: string;
  icon: React.ReactNode;
}

export default function BrandingPanel({ userType }: BrandingPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides: ProviderSlide[] = [
    {
      id: 'costureira',
      name: 'Helena Souza',
      category: 'Costura',
      role: 'Costureira Profissional',
      rating: 4.9,
      reviewsCount: 124,
      status: 'Disponível para atendimento em domicílio',
      description: 'Especialista em ajustes de roupas, vestidos de festa e confecção sob medida com acabamento refinado de alta costura.',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200',
      icon: <Scissors className="h-4.5 w-4.5 text-pink-400" />
    },
    {
      id: 'informatica',
      name: 'Lucas Lima',
      category: 'Informática',
      role: 'Técnico de TI & Redes',
      rating: 4.8,
      reviewsCount: 89,
      status: 'Atendendo chamado na Vila Mariana',
      description: 'Suporte completo para computadores, notebooks, configuração de redes Wi-Fi domésticas e remoção de vírus com rapidez.',
      imageUrl: 'https://images.unsplash.com/photo-1597872200370-7a9ebc6b53f6?auto=format&fit=crop&q=80&w=1200',
      icon: <Laptop className="h-4.5 w-4.5 text-cyan-400" />
    },
    {
      id: 'domesticos',
      name: 'Marinalva Santos',
      category: 'Domésticos',
      role: 'Diarista & Organizadora',
      rating: 5.0,
      reviewsCount: 210,
      status: 'Disponível para agendamento esta semana',
      description: 'Profissional especializada em limpeza residencial detalhada, pós-obra e organização de closets e cozinhas.',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200',
      icon: <Sparkles className="h-4.5 w-4.5 text-amber-400" />
    },
    {
      id: 'encanador',
      name: 'Ricardo Mendes',
      category: 'Encanador',
      role: 'Encanador Hidráulico',
      rating: 4.9,
      reviewsCount: 145,
      status: 'Disponível para emergências 24h',
      description: 'Detecção de vazamentos invisíveis com geofone, desentupimentos, instalação de torneiras, chuveiros e reparos hidráulicos em geral.',
      imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200',
      icon: <Wrench className="h-4.5 w-4.5 text-blue-400" />
    },
    {
      id: 'pedreiro',
      name: 'José Silva',
      category: 'Pedreiro',
      role: 'Pedreiro & Azulejista',
      rating: 4.7,
      reviewsCount: 76,
      status: 'Realizando orçamentos gratuitos',
      description: 'Construção, reformas residenciais de pequeno e grande porte, assentamento de pisos, porcelanato, azulejos e reboco fino.',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200',
      icon: <Hammer className="h-4.5 w-4.5 text-emerald-400" />
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  const getBrandingTexts = (type: UserType) => {
    switch (type) {
      case 'technician':
        return {
          badge: 'RECEBA CHAMADOS NA SUA REGIÃO',
          title: 'Aumente seus clientes com total autonomia',
        };
      case 'company':
        return {
          badge: 'CONSOLIDE SUA EMPRESA DE SERVIÇOS',
          title: 'Gerencie e escale sua equipe com facilidade',
        };
      case 'client':
      default:
        return {
          badge: 'CONTRATAÇÃO DE SERVIÇOS EM DOMICÍLIO',
          title: 'Encontre profissionais de confiança perto de você',
        };
    }
  };

  const texts = getBrandingTexts(userType);

  return (
    <section className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-zinc-950 z-10 min-h-full p-12 select-none">
      {/* Background Vitrine Carrossel (Image Slide) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.00 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.name}
              className="w-full h-full object-cover brightness-[0.6] saturate-[0.85]"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Soft elegant vignette overlay for perfect contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/40 to-zinc-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_20%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Top Header Overlay */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs font-black text-white tracking-widest">T</span>
          </div>
          <span className="text-sm font-black tracking-[0.25em] text-white uppercase font-sans">
            TechFix <span className="text-indigo-400 font-medium font-mono text-[9px] tracking-normal rounded px-1.5 py-0.5 ml-1 bg-indigo-950/50">SERVIÇOS</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-zinc-950/80 backdrop-blur-md px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-300 font-mono shadow-xl">
          <Users size={10} className="text-emerald-400 animate-pulse" /> 532 Online
        </div>
      </div>

      {/* Center Title overlay (Gives identity to the section) */}
      <div className="relative z-20 max-w-lg mt-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 backdrop-blur px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-300 shadow-sm">
          <CheckCircle2 size={10} className="text-indigo-400" />
          <span>{texts.badge}</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight leading-[1.2] text-white drop-shadow-sm">
          {texts.title}
        </h1>
      </div>

      {/* Floating Spotlight Card (Premium iOS/Apple visual widget) */}
      <div className="relative z-20 mt-auto max-w-xl">
        <div className="relative rounded-3xl bg-zinc-950/55 backdrop-blur-xl shadow-2xl p-6 md:p-8 overflow-hidden">
          {/* Subtle light reflection on card border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Header inside the Spotlight Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900/90 flex items-center justify-center shadow-inner">
                    {currentSlide.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white tracking-tight">
                      {currentSlide.name}
                    </h3>
                    <p className="text-[10px] text-indigo-400 font-bold font-mono tracking-widest uppercase mt-0.5">
                      {currentSlide.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-400 bg-zinc-900/60 px-2.5 py-1 rounded-xl text-xs font-bold">
                  <Star size={12} className="fill-amber-400" />
                  <span>{currentSlide.rating.toFixed(1)}</span>
                  <span className="text-zinc-500 font-normal">({currentSlide.reviewsCount})</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentSlide.status}
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-zinc-300 font-medium leading-relaxed">
                {currentSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-5 mt-5">
            {/* Progress/Slide Indicators */}
            <div className="flex gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="relative h-1 rounded-full overflow-hidden bg-zinc-800 transition-all duration-300"
                  style={{ width: currentIndex === idx ? '24px' : '6px' }}
                  aria-label={`Ir para prestador ${idx + 1}`}
                >
                  {currentIndex === idx && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-indigo-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-1.5">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
                aria-label="Prestador anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-200"
                aria-label="Próximo prestador"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Minimal trust badging at bottom */}
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold mt-4 justify-center lg:justify-start">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-indigo-400" />
            <span>Plataforma Segura</span>
          </div>
          <span className="text-zinc-800">•</span>
          <span>Profissionais Verificados</span>
        </div>
      </div>
    </section>
  );
}
