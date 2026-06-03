import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, CheckCircle, MapPin, Star, Link2, Check } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.031 2C6.479 2 2 6.479 2 12.03c0 1.907.528 3.67 1.439 5.177L2 22l4.927-1.39A9.97 9.97 0 0012.03 22c5.55 0 10.03-4.479 10.03-10.03S17.58 2 12.03 2zm6.09 14.224c-.25.705-1.45 1.345-2.029 1.433-.518.077-1.173.109-1.892-.119a22.25 22.25 0 01-5.111-4.521c-.15-.2-.15-.2.025-.4.175-.2.775-.875.975-1.175.2-.3.15-.45.05-.675-.1-.225-.925-2.225-1.2-2.888-.275-.662-.55-.575-.75-.587-.2-.012-.425-.012-.65-.012a1.25 1.25 0 00-.9.425c-.325.35-1.225 1.2-1.225 2.925s1.25 3.375 1.425 3.6c.175.225 2.45 3.74 5.925 5.24.825.35 1.475.562 1.975.72.825.263 1.575.225 2.175.137.675-.1 2.05-.838 2.338-1.65.287-.812.287-1.5.2-1.65-.088-.15-.313-.238-.688-.425z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const ThreadsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.685 10.66c-.198-.016-.366-.024-.5-.024-.887 0-1.597.228-2.115.679-.475.408-.715.96-.715 1.637 0 .634.22 1.157.653 1.554.457.414 1.077.625 1.838.625.864 0 1.545-.258 2.022-.768.498-.535.753-1.25.76-2.128-.01-.767-.246-1.395-.7-1.854-.316-.317-.745-.589-1.243-.72zm3.329 1.722c-.015 1.488-.475 2.723-1.365 3.673-.895.955-2.164 1.442-3.774 1.442-1.332 0-2.428-.387-3.26-1.15-.815-.75-1.233-1.758-1.246-3.003-.005-1.286.425-2.338 1.28-3.132.845-.78 1.956-1.18 3.308-1.196.425-.005.862.031 1.298.106.666.115 1.252.327 1.742.632l-.99 1.61c-.378-.204-.79-.344-1.222-.416-.27-.044-.543-.066-.818-.066-1.597 0-2.404.912-2.41 2.723.275-.246.602-.44.97-.58.455-.176.993-.264 1.603-.264 1.34 0 2.378.36 3.084 1.077.674.685 1.012 1.602 1.01 2.723zm6.986-.382c0 2.725-.632 4.982-1.895 6.763-1.614 2.277-4.146 3.51-7.525 3.666-4.632.222-8.318-1.127-10.96-4.01-2.42-2.636-3.64-5.945-3.64-9.84C0 6.002 1.184 2.946 3.516.852 5.866-1.257 9.155.08 13.125.08c2.19 0 4.148.423 5.82 1.256l-1.073 1.674c-1.393-.666-2.977-1.01-4.747-1.01-3.2 0-5.835 1.018-7.838 3.023-2.025 2.025-3.05 4.545-3.05 7.487 0 2.96 1 5.485 2.968 7.49 1.986 2.016 4.57 3.04 7.676 3.04 2.808 0 4.954-1.002 6.38-2.98 1.077-1.49 1.625-3.376 1.625-5.608 0-1.865-.333-3.397-1-4.595-.697-1.253-1.748-2.224-3.125-2.888-1.365-.658-2.945-.992-4.704-.992-2.316 0-4.32.55-5.95 1.64-1.602 1.073-2.404 2.597-2.404 4.526 0 1.222.378 2.223 1.134 2.977.75.748 1.705 1.122 2.84 1.122.95 0 1.785-.295 2.482-.878.694-.582 1.04-1.385 1.04-2.392 0-1.037-.34-1.863-1.018-2.463-.683-.604-1.576-.906-2.66-.906h-.14c.26-.815.753-1.442 1.47-1.87.72-.43 1.627-.648 2.705-.648 1.41 0 2.635.29 3.642.862 1.016.575 1.783 1.392 2.284 2.43.5 1.033.754 2.376.753 4.004z" />
  </svg>
);

type ProfileShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
};

export function ProfileShareModal({ isOpen, onClose, profile }: ProfileShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instagramInfo, setInstagramInfo] = useState(false);

  // Dynamic share text and URLs
  const shareText = `Confira o perfil de ${profile.name} no Buscador Técnico!`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://buscadortecnico.com';
  const shareUrl = `${origin}/profile/${profile.slug || profile.id}`;
  const displayUrl = `buscadortecnico.com/profile/${profile.slug || profile.id}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const threadsUrl = `https://threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  // Lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    
    try {
      setIsGenerating(true);
      setSuccess(false);

      // Generate Image
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          borderRadius: '0px'
        }
      });

      // Download the image
      const filename = `perfil-${profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      setSuccess(true);
      return dataUrl;
    } catch (err) {
      console.error('Erro ao gerar card:', err);
      alert('Erro ao gerar a imagem de compartilhamento. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = async () => {
    // Copy link
    handleCopyLink();
    // Trigger download
    await handleDownloadCard();
    // Show instruction banner
    setInstagramInfo(true);
    setTimeout(() => setInstagramInfo(false), 8000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center sm:p-4 pb-0 bg-black/80 backdrop-blur-md sm:overflow-y-auto">
          {/* Fundo clicável para fechar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#090b11] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-white/5"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <Share2 size={20} className="text-blue-500" />
                <h3 className="font-extrabold text-white text-lg tracking-tight">Compartilhar Perfil</h3>
              </div>
              <button 
                onClick={onClose}
                className="h-8 w-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto scrollbar-hide flex flex-col space-y-6">
              
              {/* Subheading */}
              <p className="text-xs font-semibold text-slate-400 text-center leading-relaxed px-4">
                Gere um <strong className="text-white">Card Digital</strong> ou compartilhe seu perfil no WhatsApp, Instagram, Threads ou LinkedIn!
              </p>

              {/* O Card Oculto (Gerado dinamicamente para o print em Alta Definição) */}
              <div className="w-[400px] absolute -left-[9999px]">
                <div 
                  ref={cardRef} 
                  className="w-[400px] bg-[#090b11] text-white rounded-3xl overflow-hidden p-10 flex flex-col items-center text-center shadow-2xl border-4 border-blue-600 relative"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Top Label */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Buscador Técnico</span>
                  </div>

                  {/* Avatar com Selo de Verificado */}
                  <div className="relative mt-2">
                    {profile.avatarUrl ? (
                      <img crossOrigin="anonymous" src={profile.avatarUrl} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-blue-500/20 object-cover shadow-xl z-10" />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-blue-600 border-4 border-blue-500/20 flex items-center justify-center text-4xl font-black shadow-xl z-10 text-white">
                        {profile.name?.charAt(0)}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 border-4 border-[#090b11] shadow-lg flex items-center justify-center z-20">
                      <CheckCircle size={14} className="fill-current" />
                    </div>
                  </div>

                  {/* Nome */}
                  <h1 className="text-3xl font-black mt-5 tracking-tight text-white">{profile.name}</h1>
                  
                  {/* Localização & Avaliação */}
                  <div className="flex items-center gap-3 mt-2.5 text-xs font-bold text-slate-400 z-10">
                    <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500" /> {profile.city || 'Brasil'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-500"><Star size={14} className="fill-current" /> {profile.rating ? Number(profile.rating).toFixed(1) : '5.0'}</span>
                  </div>

                  {/* Especialidades */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6 z-10">
                    {profile.specialties?.slice(0, 3).map((s: string) => (
                      <span key={s} className="px-3.5 py-1.5 bg-white/5 rounded-xl text-xs font-bold border border-white/10 uppercase tracking-wider text-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Rodapé CTA */}
                  <div className="mt-8 pt-6 border-t border-white/5 w-full flex flex-col items-center gap-3 z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">Acesse o perfil completo em</span>
                    <div className="px-5 py-2 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black tracking-wide border border-blue-500/20 max-w-full truncate">
                      {displayUrl}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pré-visualização do Card Bonitão (Escalada para tela de celular) */}
              <div 
                className="w-full bg-[#0d0f17] text-white rounded-[2rem] p-6 flex flex-col items-center text-center border border-white/10 relative shadow-2xl"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                  backgroundSize: '14px 14px'
                }}
              >
                {/* Top Label */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Buscador Técnico</span>
                </div>

                {/* Avatar com Selo de Verificado */}
                <div className="relative">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-blue-500/20 object-cover shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-600 border-2 border-blue-500/20 flex items-center justify-center text-2xl font-black text-white">
                      {profile.name?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-[#0d0f17] shadow-md flex items-center justify-center">
                    <CheckCircle size={10} className="fill-current" />
                  </div>
                </div>

                {/* Nome */}
                <h1 className="text-xl font-black mt-4 tracking-tight">{profile.name}</h1>
                
                {/* Localização & Avaliação */}
                <div className="flex items-center gap-2.5 mt-1.5 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {profile.city || 'Brasil'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500"><Star size={12} className="fill-current" /> {profile.rating ? Number(profile.rating).toFixed(1) : '5.0'}</span>
                </div>

                {/* Especialidades */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {profile.specialties?.slice(0, 3).map((s: string) => (
                    <span key={s} className="px-2.5 py-1 bg-white/5 rounded-lg text-[9px] font-black border border-white/5 uppercase tracking-wider text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Rodapé CTA */}
                <div className="mt-6 pt-4 border-t border-white/5 w-full flex flex-col items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Acesse o perfil completo em</span>
                  <div className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-black border border-blue-500/20 max-w-full truncate">
                    {displayUrl}
                  </div>
                </div>
              </div>

              {/* Botões de Ação Redesenhados em Grid Premium */}
              <div className="flex flex-col gap-4 pt-2">
                {/* Grid de Ícones Diretos de Redes Sociais e Ações */}
                <div className="grid grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-md shadow-emerald-500/5">
                      <WhatsAppIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                  </a>

                  {/* Instagram */}
                  <button
                    onClick={handleInstagramShare}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-rose-500/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:via-rose-500 group-hover:to-purple-600 group-hover:text-white transition-all shadow-md shadow-rose-500/5">
                      <InstagramIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-rose-400 transition-colors">Instagram</span>
                  </button>

                  {/* Threads */}
                  <a
                    href={threadsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/20 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-md shadow-white/5">
                      <ThreadsIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Threads</span>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#0A66C2] flex items-center justify-center group-hover:bg-[#0A66C2] group-hover:text-white transition-all shadow-md shadow-blue-500/5">
                      <LinkedInIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#0A66C2] transition-colors">LinkedIn</span>
                  </a>

                  {/* Baixar Card (Premium Action) */}
                  <button
                    onClick={handleDownloadCard}
                    disabled={isGenerating}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all shadow-md shadow-indigo-500/10 border border-indigo-500/20 group-hover:border-transparent">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Baixar Card</span>
                  </button>

                  {/* Copiar Link */}
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      copied 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                        : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white shadow-md shadow-emerald-500/5'
                    }`}>
                      {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                      copied ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'
                    }`}>
                      {copied ? 'Copiado!' : 'Copiar Link'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Dica para compartilhamento no Instagram */}
              {instagramInfo && (
                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-rose-400 uppercase tracking-wider">Dica do Instagram</h5>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5 leading-tight">
                      Card baixado e link copiado! Crie um Story ou publicação e cole o link de acesso.
                    </p>
                  </div>
                </div>
              )}

              {/* Notificação de sucesso visual */}
              {success && !instagramInfo && (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Ação Concluída!</h5>
                    <p className="text-[10px] text-emerald-500/80 font-bold mt-0.5 leading-tight">Card de perfil compartilhado ou baixado com sucesso.</p>
                  </div>
                </div>
              )}
            </div>

            {isGenerating && (
              <div className="absolute inset-0 bg-[#090b11]/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-extrabold text-blue-500 animate-pulse text-xs uppercase tracking-widest">Gerando Card Digital...</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}