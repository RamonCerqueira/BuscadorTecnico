'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/api/client';
import { FileUpload } from '@/components/ui/file-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Send, 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  Tag, 
  Wind, 
  Zap, 
  Droplets, 
  HardHat, 
  Monitor,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'Ar Condicionado', icon: Wind, color: 'text-blue-500' },
  { id: 'Elétrica', icon: Zap, color: 'text-amber-500' },
  { id: 'Hidráulica', icon: Droplets, color: 'text-cyan-500' },
  { id: 'Reformas', icon: HardHat, color: 'text-orange-500' },
  { id: 'Informática', icon: Monitor, color: 'text-indigo-500' },
];

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [category, setCategory] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => apiPost('/tickets', {
      title,
      description,
      locationText,
      category,
      mediaUrls
    }),
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationText || !category) return;
    createMutation.mutate();
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-sm w-full space-y-6"
        >
          <div className="h-20 w-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black">Chamado Publicado!</h2>
          <p className="text-slate-500 font-medium italic">Sua solicitação já está visível para os melhores profissionais da região.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0a] transition-colors duration-300">
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:shadow-xl transition-all group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Novo <span className="text-blue-600">Chamado</span></h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Publique seu problema agora</p>
            </div>
          </div>
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
            <Sparkles size={20} />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Categoria */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
               <Tag size={14} className="text-blue-500" /> Selecione a Categoria
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
               {CATEGORIES.map((cat) => {
                 const Icon = cat.icon;
                 const active = category === cat.id;
                 return (
                   <button
                     key={cat.id}
                     type="button"
                     onClick={() => setCategory(cat.id)}
                     className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${active ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-blue-500/50'}`}
                   >
                     <Icon size={24} className={active ? 'text-white' : cat.color} />
                     <span className="text-[10px] font-black uppercase tracking-tight">{cat.id.split(' ')[0]}</span>
                   </button>
                 );
               })}
            </div>
          </section>

          <div className="glass-card bg-white dark:bg-[#111] p-8 sm:p-10 space-y-8 shadow-2xl">
            {/* Título */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">O que aconteceu?</label>
              <input
                className="input-field h-16 text-lg font-bold"
                placeholder="Ex: Ar condicionado vazando água"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Detalhes do problema</label>
              <textarea
                rows={5}
                className="input-field min-h-[150px] py-4 text-base leading-relaxed resize-none"
                placeholder="Conte mais detalhes para que o técnico possa dar um orçamento preciso. O que você já tentou fazer?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Localização */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Onde você está?</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600" size={20} />
                <input
                  className="input-field pl-12 h-16 font-bold"
                  placeholder="Endereço completo, bairro ou cidade"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
               <Sparkles size={14} className="text-blue-500" /> Fotos do Equipamento (Opcional)
            </div>
            <FileUpload 
              onUpload={(urls) => setMediaUrls((prev) => [...prev, ...urls])} 
              maxFiles={5} 
              label="Arraste fotos ou clique para enviar"
            />
          </div>

          {createMutation.isError && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-5 text-sm font-bold text-rose-500 border border-rose-500/20"
            >
              <AlertCircle size={20} />
              <span>Ocorreu um erro ao criar o chamado. Verifique os dados e tente novamente.</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending || !category}
            className="btn-primary w-full py-6 text-lg font-black uppercase tracking-[0.2em] shadow-blue-600/20 flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
          >
            {createMutation.isPending ? (
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <>
                Publicar Chamado <Send size={20} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Ao publicar, você concorda com nossos termos de segurança.
          </p>
        </form>
      </main>
    </div>
  );
}
