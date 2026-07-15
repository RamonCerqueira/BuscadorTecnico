'use client';

import { MapPin, ShieldCheck, Star, Share2, Heart, MessageSquare, CheckCircle, X, Send, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api/client';
import { ProfileShareModal } from './profile-share-modal';
import { motion, AnimatePresence } from 'framer-motion';

type PublicProfileHeroProps = {
  profile: any;
};

export function PublicProfileHero({ profile }: PublicProfileHeroProps) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Direct Hire Modal States
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireMessage, setHireMessage] = useState('');
  const [hireLocation, setHireLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch logged-in user (client) info
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiGet<any>('/users/me'),
    retry: false,
  });

  // Prefill location once client info is loaded
  useEffect(() => {
    if (me) {
      const addressParts = [];
      if (me.address) addressParts.push(me.address);
      if (me.city) addressParts.push(me.city);
      if (me.state) addressParts.push(me.state);
      setHireLocation(addressParts.join(', '));
    }
  }, [me]);

  const hireMutation = useMutation({
    mutationFn: async () => {
      // 1. Create the direct ticket
      const ticket = await apiPost<any>('/tickets', {
        title: `Contratação Direta - ${profile.name}`,
        description: hireMessage,
        locationText: hireLocation || 'À combinar',
        category: profile.specialties?.[0] || 'Geral',
        assignedToId: profile.id,
      });

      // 2. Send the first message in the chat
      await apiPost(`/tickets/${ticket.id}/messages`, {
        content: hireMessage,
      });

      return ticket;
    },
    onSuccess: (ticket) => {
      setIsHireModalOpen(false);
      setHireMessage('');
      router.push(`/tickets/${ticket.id}/chat`);
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Falha ao iniciar negociação. Tente novamente.');
    },
  });

  const handleHireClick = () => {
    if (!me) {
      // If not logged in, redirect to login
      router.push(`/login?redirect=/profile/${profile.id}`);
      return;
    }
    if (me.userType === 'technician' || me.userType === 'company') {
      alert('Apenas clientes podem contratar prestadores de serviço.');
      return;
    }
    setIsHireModalOpen(true);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Seu navegador não suporta geolocalização.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            const street = addr.road || addr.pedestrian || addr.street || '';
            const number = addr.house_number || '';
            const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
            const city = addr.city || addr.town || addr.village || '';
            const state = addr.state || '';

            const parts = [];
            if (street) parts.push(number ? `${street}, ${number}` : street);
            if (neighborhood) parts.push(neighborhood);
            if (city) parts.push(city);
            if (state) parts.push(state);

            setHireLocation(parts.join(', '));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        setIsGettingLocation(false);
        alert('Não foi possível obter sua localização atual.');
      }
    );
  };

  // Generate a premium gradient background string based on user ID or name
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-indigo-950 via-zinc-900 to-[#07070a]',
    'from-violet-950 via-zinc-900 to-[#07070a]',
    'from-zinc-900 via-zinc-900 to-[#07070a]',
  ];
  const bgGradient = gradients[gradientId];

  return (
    <section className="relative">
      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
      />

      {/* Cover Photo Area */}
      <div
        className={`h-48 md:h-64 w-full rounded-b-3xl md:rounded-3xl ${
          !profile.coverUrl ? `bg-gradient-to-r ${bgGradient}` : 'bg-zinc-950'
        } relative overflow-hidden border border-zinc-200/10 dark:border-zinc-800/60`}
      >
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/10" />

        {/* Top actions */}
        <div className="absolute top-6 right-6 flex gap-3 z-20">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/15 shadow-sm"
          >
            <Share2 size={14} />
          </button>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`h-9 w-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-colors border border-white/15 shadow-sm ${
              isLiked ? 'text-rose-500 hover:bg-white/20' : 'text-white hover:text-rose-500 hover:bg-white/20'
            }`}
          >
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Profile Info Overlay */}
      <div className="max-w-4xl mx-auto px-6 relative -mt-20 sm:-mt-24 z-10">
        <div className="bg-white dark:bg-[#0c0c0e]/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-end backdrop-blur-md shadow-lg shadow-zinc-950/[0.02]">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-32 w-32 md:h-36 md:w-36 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-[#07070a] overflow-hidden flex items-center justify-center shadow-lg relative z-10">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-extrabold text-zinc-300 dark:text-zinc-650">
                  {profile.name.charAt(0)}
                </span>
              )}
            </div>
            {(profile.kycStatus === 'approved' || profile.livenessVerified) && (
              <div
                className="absolute -bottom-1 -right-1 h-8 w-8 bg-indigo-500 rounded-full border-4 border-white dark:border-[#0c0c0e] flex items-center justify-center text-white shadow-md z-20"
                title="Identidade Verificada"
              >
                <ShieldCheck size={16} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3 pb-1">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {profile.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-indigo-500/80" />
                  {profile.city}, {profile.state}
                </span>
                <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                <span className="flex items-center gap-1 text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                  <Star size={11} fill="currentColor" />
                  <span className="text-[10px] font-bold">
                    {Number(profile.rating || 0).toFixed(1)} ({profile.totalReviews || 0})
                  </span>
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pt-1">
              {profile.kycStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/10">
                  <ShieldCheck size={11} /> Antecedentes Verificados
                </span>
              )}
              {profile.livenessVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/10">
                  <CheckCircle size={11} /> Biometria Facial
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto shrink-0 pb-1">
            <button
              onClick={handleHireClick}
              className="w-full md:w-auto rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-6 py-3 text-xs font-semibold tracking-wide active:scale-[0.98] transition-all hover:bg-zinc-850 dark:hover:bg-zinc-200 flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <MessageSquare size={14} /> Contratar Agora
            </button>
          </div>
        </div>
      </div>

      {/* Direct Hire Modal Overlay */}
      <AnimatePresence>
        {isHireModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left space-y-6"
            >
              <button
                onClick={() => setIsHireModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-650 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-500" /> Contratar {profile.name}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Envie uma mensagem descrevendo seu problema para iniciar a negociação no chat.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Sua mensagem inicial
                  </label>
                  <textarea
                    rows={4}
                    value={hireMessage}
                    onChange={(e) => setHireMessage(e.target.value)}
                    placeholder="Olá! Preciso de um orçamento para..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-medium text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Endereço do atendimento
                    </label>
                    <button
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="text-[10px] font-semibold text-indigo-500 hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <Navigation size={10} /> Usar GPS
                    </button>
                  </div>
                  <input
                    type="text"
                    value={hireLocation}
                    onChange={(e) => setHireLocation(e.target.value)}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsHireModalOpen(false)}
                  className="flex-1 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 py-3 text-xs font-semibold active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => hireMutation.mutate()}
                  disabled={hireMutation.isPending || !hireMessage.trim() || !hireLocation.trim()}
                  className="flex-1 rounded-full bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 py-3 text-xs font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={12} />
                  {hireMutation.isPending ? 'Iniciando...' : 'Iniciar Negociação'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
