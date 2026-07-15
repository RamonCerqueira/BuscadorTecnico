'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api/client';
import { FileUpload } from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Send, 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  CheckCircle2,
  Navigation,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES, URGENCIES } from '@/lib/constants';

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(searchParams.get('desc') || '');
  const aiInsights = searchParams.get('diagnostic') || undefined;
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [locationText, setLocationText] = useState('');
  const [urgency, setUrgency] = useState('');
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => {
      // Truque: anexar urgência na descrição sem quebrar o banco de dados
      const finalDescription = urgency ? `[Urgência: ${urgency}]\n\n${description}` : description;

      const finalCategory = category === 'Outros' ? customCategory : category;

      return apiPost('/tickets', {
        title,
        description: finalDescription,
        locationText,
        category: finalCategory,
        mediaUrls,
        aiInsights,
        assignedToId: searchParams.get('assignedToId') || undefined
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard'), 3000);
    }
  });

  const handleNext = (overrideCategory?: string) => {
    if (step === 1) {
      const currentCat = overrideCategory || category;
      if (!currentCat) return;
      if (currentCat === 'Outros' && !customCategory.trim()) return;
    }
    if (step === 2 && (!title || !description)) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (searchQuery) {
    const hasExactMatch = CATEGORIES.some(c => c.id.toLowerCase() === searchQuery.toLowerCase());
    
    // Create the dynamic card
    if (!hasExactMatch) {
      filteredCategories.unshift({
        id: searchQuery, // the user's search text
        icon: Sparkles, // generic nice icon
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
      });
    }

    // Still append Outros if it's missing from the search results
    if (!filteredCategories.find(c => c.id === 'Outros')) {
      const outrosCat = CATEGORIES.find(c => c.id === 'Outros');
      if (outrosCat) filteredCategories.push(outrosCat);
    }
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title || !description || !locationText || !category) return;
    createMutation.mutate();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          
          // Reverse geocoding using Nominatim OpenStreetMap API
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: {
              'Accept-Language': 'pt-BR,pt;q=0.9',
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            
            // Build a formatted address string
            const street = addr.road || addr.pedestrian || addr.street || '';
            const number = addr.house_number || '';
            const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || '';
            const state = addr.state || '';
            const postcode = addr.postcode || '';

            const parts = [];
            if (street) parts.push(number ? `${street}, ${number}` : street);
            if (neighborhood) parts.push(neighborhood);
            if (city) parts.push(city);
            if (state) parts.push(state);

            let formattedAddress = parts.join(', ');
            if (postcode) formattedAddress += ` - CEP: ${postcode}`;

            if (formattedAddress) {
              setLocationText(formattedAddress);
            } else {
              // Fallback se a API retornar sucesso mas sem dados detalhados úteis
              setLocationText(data.display_name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (GPS)`);
            }
          } else {
            throw new Error('Falha na API de Geocoding');
          }
        } catch (error) {
          console.error('Erro ao converter coordenadas em endereço:', error);
          const { latitude, longitude } = pos.coords;
          setLocationText(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (GPS)`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setIsGettingLocation(false);
        alert("Não foi possível acessar sua localização. Verifique as permissões.");
      }
    );
  };

  if (isSuccess) {
    const isDirectHire = !!searchParams.get('assignedToId');
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-md w-full space-y-6 shadow-2xl shadow-emerald-500/10"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="h-24 w-24 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 rotate-3"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          <h2 className="text-3xl font-black">
            {isDirectHire ? 'Pedido Enviado!' : 'Chamado Criado!'}
          </h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            {isDirectHire 
              ? 'Seu chamado foi enviado diretamente ao profissional escolhido. Você será notificado assim que receber o retorno!' 
              : 'Seu pedido foi disparado para os melhores profissionais da região. Fique de olho nas propostas!'}
          </p>
          <div className="pt-4">
            <div className="h-1.5 w-32 bg-slate-100 dark:bg-white/5 rounded-full mx-auto overflow-hidden">
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                 className="h-full w-1/2 bg-emerald-500 rounded-full"
               />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-16">
        
        {/* Header & Progress */}
        <header className="mb-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={() => step === 1 ? router.push('/dashboard') : handlePrev()}
                className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:shadow-xl transition-all group"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Novo <span className="text-blue-600">Chamado</span></h1>
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Passo {step} de 3
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: step >= s ? '100%' : '0%' }}
                  className="h-full bg-blue-600"
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
        </header>

        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* PASS 1: CATEGORIA */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-black">Qual é o tipo de serviço?</h2>
                  <p className="text-slate-500">Selecione a categoria que melhor descreve o seu problema.</p>
                </div>
                
                {/* Busca */}
                <div className="relative max-w-md mx-auto mb-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                    placeholder="Buscar categoria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredCategories.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { 
                          setCategory(cat.id); 
                          if (cat.id !== 'Outros') {
                            setTimeout(() => handleNext(cat.id), 300); 
                          }
                        }}
                        className={`group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
                          active 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-[1.02]' 
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-500/50 hover:shadow-xl'
                        }`}
                      >
                        <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-white/20' : cat.bg}`}>
                          <Icon size={28} className={active ? 'text-white' : cat.color} />
                        </div>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-center">{cat.id}</span>
                        
                        {active && (
                          <motion.div layoutId="active-ring" className="absolute inset-0 rounded-3xl border-2 border-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Campo para categoria personalizada quando 'Outros' é selecionado */}
                <AnimatePresence>
                  {category === 'Outros' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="glass-card bg-white dark:bg-[#111] p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Qual é o serviço?</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            autoFocus
                            className="input-field flex-1 h-14 bg-slate-50 dark:bg-[#1a1a1a] font-bold text-lg px-4"
                            placeholder="Ex: Instalação de papel de parede"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customCategory.trim()) {
                                handleNext();
                              }
                            }}
                          />
                          <button
                            onClick={() => handleNext()}
                            disabled={!customCategory.trim()}
                            className="btn-primary px-6 rounded-xl flex items-center justify-center disabled:opacity-50"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* PASS 2: DETALHES */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-black">Descreva o Problema</h2>
                  <p className="text-slate-500">Quanto mais detalhes, orçamentos mais precisos você receberá.</p>
                </div>

                <div className="glass-card bg-white dark:bg-[#111] p-6 sm:p-10 space-y-8 shadow-2xl">
                  {/* Título */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">O que aconteceu?</label>
                    <input
                      className="input-field h-16 text-lg font-bold bg-slate-50 dark:bg-[#1a1a1a]"
                      placeholder="Ex: Ar condicionado pingando água"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-3 relative group">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mais Detalhes</label>
                    </div>
                    
                    <textarea
                      rows={5}
                      className="input-field min-h-[150px] py-4 text-base leading-relaxed resize-none bg-slate-50 dark:bg-[#1a1a1a]"
                      placeholder="Marca do aparelho, quando começou, barulhos estranhos..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    
                    {/* Tooltip hint */}
                    <div className="absolute -top-10 right-0 opacity-0 group-focus-within:opacity-100 transition-opacity bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-lg pointer-events-none">
                      Dica: Informe o modelo se souber!
                    </div>
                  </div>

                  {/* Fotos */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                       <Sparkles size={14} className="text-blue-500" /> Fotos (Opcional)
                    </div>
                    <FileUpload 
                      onUpload={(urls) => setMediaUrls((prev) => [...prev, ...urls])} 
                      maxFiles={5} 
                      label="Arraste as fotos do problema ou clique aqui"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleNext()}
                    disabled={!title || !description}
                    className="btn-primary py-4 px-8 text-sm font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                  >
                    Próximo Passo <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASS 3: LOCALIZAÇÃO E FINALIZAÇÃO */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-2xl font-black">Onde e Quando?</h2>
                  <p className="text-slate-500">Últimas informações para os profissionais.</p>
                </div>

                <div className="glass-card bg-white dark:bg-[#111] p-6 sm:p-10 space-y-10 shadow-2xl">
                  
                  {/* Urgência */}
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Qual a sua pressa?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {URGENCIES.map((u) => {
                         const Icon = u.icon;
                         const active = urgency === u.id;
                         return (
                           <button
                             key={u.id}
                             type="button"
                             onClick={() => setUrgency(u.id)}
                             className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${active ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl' : `bg-white dark:bg-white/5 ${u.border} text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10`}`}
                           >
                             <Icon size={20} className={active ? '' : u.color} />
                             <div className="text-left">
                               <div className="text-xs font-black uppercase tracking-widest">{u.id}</div>
                               <div className="text-[10px] opacity-70">{u.label}</div>
                             </div>
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400">Onde você está?</label>
                       <button 
                         type="button"
                         onClick={handleGetLocation}
                         disabled={isGettingLocation}
                         className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                       >
                         {isGettingLocation ? (
                           <span className="animate-pulse">Buscando...</span>
                         ) : (
                           <><Navigation size={12} /> Usar minha localização</>
                         )}
                       </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                      <input
                        className="input-field pl-12 h-16 font-bold bg-slate-50 dark:bg-[#1a1a1a]"
                        placeholder="Endereço completo, bairro ou cidade"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                </div>

                {createMutation.isError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-5 text-sm font-bold text-rose-500 border border-rose-500/20"
                  >
                    <AlertCircle size={20} />
                    <span>Erro ao criar chamado. Verifique a conexão e tente novamente.</span>
                  </motion.div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !locationText || !urgency}
                  className="btn-primary w-full py-6 text-lg font-black uppercase tracking-[0.1em] shadow-blue-600/20 flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.01]"
                >
                  {createMutation.isPending ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Publicar e Encontrar Técnicos <Send size={20} />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                  Ao publicar, você concorda com nossos termos de uso.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>}>
      <NewTicketForm />
    </Suspense>
  );
}
