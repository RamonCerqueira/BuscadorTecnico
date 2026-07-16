'use client';

import { useState, useMemo } from 'react';
import { useSessionStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import {
  ArrowLeft, Ticket, Plus, Trash2, Calendar, DollarSign,
  Percent, AlertCircle, Copy, Check, Sparkles, Filter, ToggleLeft, ToggleRight, Phone, MessageSquareMore
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder?: number;
  expiryDate: string;
  limitUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  user?: {
    name: string;
    userType: string;
    phone?: string;
  };
}

export default function CouponsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, userType } = useSessionStore();

  const userRole = userType || 'client';
  const isClient = userRole === 'client';
  const isTechOrCompany = userRole === 'technician' || userRole === 'company';

  // Create Coupon Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState('');
  const [limitUses, setLimitUses] = useState<number>(50);

  // Client states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');

  // React Query Integration
  const providerCouponsQuery = useQuery({
    queryKey: ['provider-coupons'],
    queryFn: () => apiGet<Coupon[]>('/coupons/provider'),
    enabled: isTechOrCompany && !!token,
  });

  const exploreCouponsQuery = useQuery({
    queryKey: ['explore-coupons'],
    queryFn: () => apiGet<Coupon[]>('/coupons/explore'),
    enabled: isClient && !!token,
  });

  const providerCoupons = providerCouponsQuery.data || [];
  const exploreCoupons = exploreCouponsQuery.data || [];

  // Create Coupon Mutation
  const createMutation = useMutation({
    mutationFn: (newCoupon: any) => apiPost<Coupon>('/coupons', newCoupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-coupons'] });
      setCode('');
      setMinOrder('');
      setValue(10);
      setLimitUses(50);
      setExpiryDate('');
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao criar o cupom promocional.');
    }
  });

  // Toggle Active Mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiPatch<Coupon>(`/coupons/${id}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-coupons'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao alterar o status do cupom.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-coupons'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao excluir o cupom.');
    }
  });

  // Submit Handler
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    createMutation.mutate({
      code: code.toUpperCase().replace(/\s+/g, ''),
      type,
      value: Number(value),
      minOrder: minOrder ? Number(minOrder) : undefined,
      expiryDate: expiryDate || undefined,
      limitUses: Number(limitUses)
    });
  };

  // Client exploration feed filter
  const filteredClientCoupons = useMemo(() => {
    return exploreCoupons.filter(c => {
      const matchSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'all' || c.type === filterType;
      return matchSearch && matchType;
    });
  }, [exploreCoupons, searchQuery, filterType]);

  // Copy to clipboard & trigger WhatsApp contact
  const handleClaimCoupon = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code.trim());
    setCopiedId(coupon.id);
    
    setTimeout(() => {
      setCopiedId(null);
      // Format text message
      const textMessage = encodeURIComponent(`Olá, adquiri o cupom ${coupon.code.toUpperCase()}, gostaria de agendar meu serviço.`);
      const phoneNum = coupon.user?.phone ? coupon.user.phone.replace(/\D/g, '') : '';
      
      // WhatsApp link fallback
      const whatsappUrl = phoneNum 
        ? `https://api.whatsapp.com/send?phone=${phoneNum}&text=${textMessage}`
        : `https://api.whatsapp.com/send?text=${textMessage}`;
        
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  const handleToggleActive = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este cupom promocional?')) {
      deleteMutation.mutate(id);
    }
  };

  // Computed metrics for provider
  const stats = useMemo(() => {
    const activeCount = providerCoupons.filter(c => c.isActive).length;
    const totalUses = providerCoupons.reduce((sum, c) => sum + c.usedCount, 0);
    const avgDiscount = providerCoupons.length 
      ? Math.round(providerCoupons.reduce((sum, c) => sum + Number(c.value), 0) / providerCoupons.length) 
      : 0;

    return { activeCount, totalUses, avgDiscount };
  }, [providerCoupons]);

  if (!token) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center p-4 bg-[#07070c]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black tracking-tight text-white">Acesso Restrito</h1>
          <p className="text-zinc-400">Faça login para acessar o painel de cupons.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#07070c] text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden pb-32">
      {/* Background Radial Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] h-[500px] w-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 relative z-10 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4">
          <button 
            onClick={() => router.back()}
            className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 transition-all border border-slate-200 dark:border-white/5"
          >
            <ArrowLeft size={12} /> Voltar ao Painel
          </button>
          
          <div className="text-left space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-zinc-400">
              Cupons de Desconto
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
              {isTechOrCompany 
                ? 'Ofereça incentivos, fidelize novos clientes com cupons personalizados e alavanque a taxa de contratação de seus orçamentos.'
                : 'Encontre e ative cupons promocionais criados pelos profissionais da plataforma. Clique no cupom para iniciar o contato com o código pré-preenchido.'
              }
            </p>
          </div>
        </header>

        {/* -------------------- TECH & COMPANY VIEW -------------------- */}
        {isTechOrCompany && (
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <section className="grid gap-4 grid-cols-3">
              <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-md text-left">
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Cupons Ativos</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-4">
                  {providerCouponsQuery.isLoading ? '...' : stats.activeCount}
                </h3>
              </div>
              <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-md text-left">
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Utilizações</span>
                <h3 className="text-3xl font-black text-emerald-500 mt-4">
                  {providerCouponsQuery.isLoading ? '...' : stats.totalUses}
                </h3>
              </div>
              <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-md text-left">
                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Desconto Médio</span>
                <h3 className="text-3xl font-black text-indigo-500 mt-4">
                  {providerCouponsQuery.isLoading ? '...' : `${stats.avgDiscount}%`}
                </h3>
              </div>
            </section>

            {/* Layout Column Form + List */}
            <section className="grid gap-8 lg:grid-cols-12 items-start">
              
              {/* Form creation */}
              <div className="lg:col-span-5 bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Plus className="text-indigo-500" size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Criar Novo Cupom</h3>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-4 text-left">
                  
                  {/* Code */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Código do Cupom</label>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="EX: CLIMARAMON15"
                      required
                      className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Tipo de Desconto</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType('percentage')}
                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                          type === 'percentage'
                            ? 'bg-indigo-500 text-white border-indigo-550'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-105 dark:hover:bg-white/10'
                        }`}
                      >
                        <Percent size={12} /> Porcentagem (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('fixed')}
                        className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center justify-center gap-1.5 transition-all ${
                          type === 'fixed'
                            ? 'bg-indigo-500 text-white border-indigo-550'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-105 dark:hover:bg-white/10'
                        }`}
                      >
                        <DollarSign size={12} /> Fixo (R$)
                      </button>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valor do Desconto</label>
                    <input 
                      type="number" 
                      min="1"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      required
                      className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Min order */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Valor Mínimo do Serviço (Opcional)</label>
                    <input 
                      type="number" 
                      placeholder="Sem mínimo"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Expiration date */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Data de Expiração (Opcional)</label>
                    <input 
                      type="date" 
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all text-zinc-500"
                    />
                  </div>

                  {/* Limit uses */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Limite de Utilizações</label>
                    <input 
                      type="number" 
                      value={limitUses}
                      onChange={(e) => setLimitUses(Number(e.target.value))}
                      required
                      className="w-full rounded-2xl bg-slate-50 dark:bg-black/10 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-slate-900 dark:text-white p-3.5 text-xs font-semibold outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-400 hover:to-purple-550 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20 border-none mt-2 disabled:opacity-50"
                  >
                    {createMutation.isPending ? 'Ativando...' : 'Ativar Cupom Promocional'}
                  </button>

                </form>
              </div>

              {/* Created Coupons list */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                  <Ticket className="text-zinc-400" size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Seus Cupons Promocionais</h3>
                </div>

                <div className="grid gap-4">
                  {providerCouponsQuery.isLoading ? (
                    <div className="space-y-4">
                      <div className="h-24 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                      <div className="h-24 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-2xl" />
                    </div>
                  ) : providerCoupons.length === 0 ? (
                    <div className="bg-white dark:bg-[#0c0c0e]/80 border-2 border-dashed border-slate-200 dark:border-zinc-850 p-12 text-center rounded-3xl">
                      <Ticket size={32} className="mx-auto text-zinc-550 mb-3" />
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Nenhum cupom criado</h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1">Crie seu primeiro cupom promocional no painel lateral.</p>
                    </div>
                  ) : (
                    providerCoupons.map((coupon) => (
                      <div 
                        key={coupon.id}
                        className={`bg-white dark:bg-[#0c0c0e]/80 border rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all relative overflow-hidden ${
                          coupon.isActive 
                            ? 'border-indigo-500/20 dark:border-zinc-800 shadow-md' 
                            : 'border-slate-200 dark:border-zinc-900 opacity-60'
                        }`}
                      >
                        {/* Coupon Ticket Body */}
                        <div className="flex items-center gap-4 flex-1">
                          
                          {/* Left icon ticket */}
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            coupon.isActive
                              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                          }`}>
                            <Ticket size={20} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm uppercase text-slate-905 dark:text-white border border-dashed border-indigo-500/40 px-2.5 py-0.5 rounded-lg bg-indigo-500/5">
                                {coupon.code}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                coupon.isActive 
                                  ? 'bg-emerald-500/10 text-emerald-500' 
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {coupon.isActive ? 'Ativo' : 'Pausado'}
                              </span>
                            </div>
                            
                            <p className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
                              Desconto: {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                              {coupon.minOrder ? ` • Min. R$ ${coupon.minOrder}` : ''}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Calendar size={9} /> Expira em: {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span>Usos: {coupon.usedCount} / {coupon.limitUses}</span>
                            </div>
                          </div>

                        </div>

                        {/* Actions controls */}
                        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleActive(coupon.id)}
                            title={coupon.isActive ? 'Pausar Campanha' : 'Ativar Campanha'}
                            className="h-10 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent dark:border-white/5"
                          >
                            {coupon.isActive ? <ToggleRight size={20} className="text-indigo-500" /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            title="Excluir Cupom"
                            className="h-10 w-10 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 transition-colors border border-rose-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>

            </section>

          </div>
        )}

        {/* -------------------- CLIENT VIEW [REDESIGNED PREMIUM TICKETS] -------------------- */}
        {isClient && (
          <div className="space-y-8">
            
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 p-4 rounded-3xl shadow-lg text-left">
              
              {/* Search */}
              <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-black/10 border border-slate-205 dark:border-zinc-800 px-4 py-3.5 rounded-2xl">
                <Filter size={12} className="text-zinc-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por código ou nome do profissional..."
                  className="bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-450 outline-none w-full font-semibold"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider hidden sm:block">Filtrar:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 outline-none p-3.5 rounded-2xl cursor-pointer"
                >
                  <option value="all">Todos os Descontos</option>
                  <option value="percentage">Porcentagem %</option>
                  <option value="fixed">Valor Fixo R$</option>
                </select>
              </div>

            </div>

            {/* Coupons explorer list */}
            <div className="grid gap-6 md:grid-cols-2 text-left">
              {exploreCouponsQuery.isLoading ? (
                <div className="md:col-span-2 space-y-4">
                  <div className="h-48 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-3xl" />
                  <div className="h-48 w-full animate-pulse bg-slate-150 dark:bg-white/5 rounded-3xl" />
                </div>
              ) : filteredClientCoupons.length === 0 ? (
                <div className="md:col-span-2 bg-white dark:bg-[#0c0c0e]/80 border-2 border-dashed border-slate-200 dark:border-zinc-850 p-16 text-center rounded-3xl shadow-sm">
                  <Ticket size={40} className="mx-auto text-zinc-550 mb-3" />
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">Nenhum cupom disponível</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-1">Nenhum profissional lançou cupons correspondentes a sua busca.</p>
                </div>
              ) : (
                filteredClientCoupons.map((coupon) => (
                  <div 
                    key={coupon.id}
                    className="relative bg-white dark:bg-[#0c0c0e]/95 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-indigo-500/30 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Glowing Accent */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-xl pointer-events-none group-hover:from-indigo-500/20 transition-all duration-500" />
                    
                    {/* Ticket notch cutouts */}
                    <div className="absolute -left-3 top-[55%] -translate-y-1/2 w-6 h-6 bg-slate-50 dark:bg-[#07070c] border-r border-slate-200 dark:border-zinc-800 rounded-full z-20"></div>
                    <div className="absolute -right-3 top-[55%] -translate-y-1/2 w-6 h-6 bg-slate-50 dark:bg-[#07070c] border-l border-slate-200 dark:border-zinc-800 rounded-full z-20"></div>

                    {/* Top block */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-black text-sm text-slate-900 dark:text-white leading-none">{coupon.user?.name || 'Técnico Especialista'}</h4>
                          <span className="text-[8px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block">
                            {coupon.user?.userType === 'company' ? 'Empresa Credenciada' : 'Técnico Autônomo'}
                          </span>
                        </div>
                        
                        {/* Discount badge */}
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-black text-emerald-500 dark:text-emerald-450 leading-none">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                          </p>
                          <span className="text-[8px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-widest block mt-1">Desconto</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
                        Ganhe {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value}`} de abatimento no valor total do serviço de manutenção ou instalação.
                      </p>
                      
                      {/* Sub-items details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-black text-zinc-500 uppercase tracking-widest pt-1 border-t border-slate-100 dark:border-zinc-850/60">
                        {coupon.minOrder ? (
                          <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                            <DollarSign size={10} className="text-indigo-550 shrink-0" /> Mínimo: R$ {Number(coupon.minOrder).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-650 dark:text-zinc-400">Sem valor mínimo</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-650 dark:text-zinc-400">
                          <Calendar size={10} className="text-indigo-550 shrink-0" /> Expira em: {new Date(coupon.expiryDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Code action copy & whatsapp redirect */}
                    <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                      
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Cupom</span>
                        <p className="font-mono font-black text-base uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                          {coupon.code}
                        </p>
                      </div>

                      <button
                        onClick={() => handleClaimCoupon(coupon)}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border-none cursor-pointer ${
                          copiedId === coupon.id
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-550 text-white shadow-indigo-500/20'
                        }`}
                      >
                        {copiedId === coupon.id ? (
                          <>
                            <Check size={12} className="animate-bounce" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Phone size={11} className="shrink-0" /> Resgatar & Agendar
                          </>
                        )}
                      </button>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Explanatory rules for client */}
            <div className="bg-white dark:bg-[#0c0c0e]/80 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl text-left space-y-3 shadow-lg">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle size={14} className="text-indigo-500" /> Como funciona o resgate?
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-600 dark:text-zinc-400 space-y-2 font-semibold">
                <li>Clique em <strong>Resgatar & Agendar</strong> no cupom promocional desejado.</li>
                <li>O código será copiado automaticamente para a área de transferência e você será redirecionado para o WhatsApp do profissional correspondente.</li>
                <li>Uma mensagem de agendamento contendo o código do cupom já estará pré-preenchida para iniciar o contato com facilidade.</li>
                <li>O desconto será aplicado sobre o orçamento acordado. Certifique-se de cumprir a validade e o valor mínimo descritos no cupom.</li>
              </ul>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
