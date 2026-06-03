import { MapPin, ShieldCheck, Star, Clock, Heart, Share2, MessageSquare, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ProfileShareModal } from './profile-share-modal';

type PublicProfileHeroProps = {
  profile: any;
};

export function PublicProfileHero({ profile }: PublicProfileHeroProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Generate a premium gradient background string based on user id or name
  const gradientId = profile.id.charCodeAt(0) % 3;
  const gradients = [
    'from-blue-600 via-indigo-600 to-purple-600',
    'from-emerald-600 via-teal-600 to-cyan-600',
    'from-amber-500 via-orange-600 to-rose-600'
  ];
  const bgGradient = gradients[gradientId];

  return (
    <section className="relative">
      <ProfileShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} profile={profile} />

      {/* Cover Photo Area */}
      <div className={`h-48 md:h-64 w-full rounded-b-[2.5rem] md:rounded-[2.5rem] ${!profile.coverUrl ? `bg-gradient-to-r ${bgGradient}` : 'bg-slate-900'} relative overflow-hidden`}>
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Top actions */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button onClick={() => setIsShareModalOpen(true)} className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-colors border border-white/10">
            <Share2 size={16} />
          </button>
          <button className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-white/10">
            <Heart size={16} />
          </button>
        </div>
      </div>

      {/* Profile Info Overlay */}
      <div className="max-w-4xl mx-auto px-6 relative -mt-20 sm:-mt-24">
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-end border border-slate-200/60 dark:border-white/10 shadow-xl shadow-black/5 dark:bg-[#111119]">
          
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] bg-slate-100 dark:bg-[#0c0d12] border-4 border-white dark:border-[#111119] overflow-hidden flex items-center justify-center shadow-2xl relative z-10">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-slate-300 dark:text-slate-600">{profile.name.charAt(0)}</span>
              )}
            </div>
            {(profile.kycStatus === 'approved' || profile.livenessVerified) && (
              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-500 rounded-full border-4 border-white dark:border-[#111119] flex items-center justify-center text-white shadow-lg z-20" title="Identidade Verificada">
                <ShieldCheck size={20} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3 pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{profile.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-rose-500" />
                    {profile.city}, {profile.state}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-black">{profile.rating || '0.0'} ({profile.totalReviews || 0})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
              {profile.kycStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  <ShieldCheck size={12} /> Antecedentes Verificados
                </span>
              )}
              {profile.livenessVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <CheckCircle size={12} /> Biometria Facial
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto shrink-0 pb-2">
            <button className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-sm font-black transition-transform hover:scale-105 shadow-xl shadow-slate-900/20 dark:shadow-white/20 flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Contratar Agora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
