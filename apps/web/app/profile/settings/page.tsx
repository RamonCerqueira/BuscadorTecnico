'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';
import { 
  User, 
  Award, 
  MapPin, 
  Plus, 
  X, 
  Save, 
  CheckCircle2, 
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Simulação de carregamento de dados (depois conectamos com a API real)
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiGet<any>('/auth/me'),
  });

  // Sincroniza os dados da API com o estado local quando carregados
  useEffect(() => {
    if (profileQuery.data) {
      setBio(profileQuery.data.bio || '');
      setSpecialties(profileQuery.data.specialties || []);
    }
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (values: any) => apiPost('/users/profile/update', values),
    onSuccess: () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  });

  const addTag = () => {
    if (newTag && !specialties.includes(newTag)) {
      setSpecialties([...specialties, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => setSpecialties(specialties.filter(t => t !== tag));

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-12 sm:px-6 bg-white selection:bg-blue-500/30">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-sm font-bold uppercase tracking-widest text-blue-600">Área do Profissional</span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">Configure seu Perfil de Elite</h1>
          <p className="mt-2 text-slate-500">Quanto mais completo seu perfil, mais confiança você passa para o cliente.</p>
        </div>
        <button 
          onClick={() => saveMutation.mutate({ bio, specialties })}
          className="btn-primary flex items-center gap-2 px-8 py-4 shadow-blue-500/20"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Salvando...' : (
            <div className="flex items-center gap-2">
              <Save size={20} /> Salvar Alterações
            </div>
          )}
        </button>
      </header>

      {isSaved && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-700 outline outline-1 outline-emerald-100"
        >
          <CheckCircle2 size={24} />
          <span className="font-bold">Alterações salvas com sucesso! Seu perfil foi atualizado.</span>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lado Esquerdo: Preview e Bio */}
        <section className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="text-blue-500" /> Biografia Profissional
            </h2>
            <textarea 
              className="input-field min-h-[200px] text-lg leading-relaxed resize-none"
              placeholder="Ex: Especialista em ar-condicionado com certificado Master. Atuo há 10 anos em toda grande SP..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="mt-4 text-xs text-slate-400 font-medium uppercase tracking-widest">
              Dica: Conte sobre seus melhores equipamentos e anos de experiência.
            </p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="text-blue-500" /> Especialidades e Tags
            </h2>
            <div className="flex gap-4 mb-6">
              <input 
                className="input-field"
                placeholder="Ex: Hidráulica, Drywall, NestJS..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <button 
                onClick={addTag}
                className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {specialties.length === 0 && <p className="text-slate-400 text-sm">Nenhuma especialidade adicionada ainda.</p>}
              {specialties.map(tag => (
                <motion.span 
                  layout
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-600 outline outline-1 outline-blue-100"
                >
                  {tag}
                  <X size={14} className="cursor-pointer hover:text-rose-500 transition-colors" onClick={() => removeTag(tag)} />
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Lado Direito: Credibilidade */}
        <aside className="space-y-8">
          <div className="glass-card p-8 bg-slate-900 text-white border-none shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
                <Award size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">Credibilidade</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2 text-blue-400">
                  <ShieldCheck size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest">Selo de Elite</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Perfis com certificação profissional ganham 80% mais destaque no marketplace do TechFix.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-400">Status do Perfil</span>
                   <span className="text-emerald-400 font-bold">Completo (90%)</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[90%] transition-all duration-1000" />
                </div>
              </div>

              <button className="w-full rounded-2xl bg-white py-4 text-sm font-extrabold text-slate-900 transition-all hover:bg-slate-100 active:scale-95 shadow-xl">
                 Adicionar Certificado
              </button>
            </div>
          </div>

          <div className="glass-card p-8 border-dashed border-2 border-slate-200">
             <div className="flex items-center gap-3 mb-4 text-slate-600">
                <MapPin size={20} />
                <h3 className="font-bold">Região de Atuação</h3>
             </div>
             <p className="text-sm text-slate-400 leading-relaxed">
               Você está configurado para atender em um raio de **30km** de sua localização base.
             </p>
             <button className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
               Alterar Raio de Atuação →
             </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
