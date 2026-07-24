'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api/client';
import { motion, AnimatePresence } from 'framer-motion';

type FileUploadProps = {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  variant?: 'grid' | 'icon';
  children?: React.ReactNode;
  className?: string;
};

export function FileUpload({ onUpload, maxFiles = 3, label = 'Anexar evidências', variant = 'grid', children, className }: FileUploadProps) {
  const [files, setFiles] = useState<{ url: string; uploading: boolean }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Limitar total de arquivos
    const remainingSlots = maxFiles - files.length;
    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    // Preparar UI
    const newFiles = filesToUpload.map(() => ({ url: '', uploading: true }));
    setFiles((prev) => [...prev, ...newFiles]);

    // Upload um por um (na prática poderia ser paralelo)
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < filesToUpload.length; i++) {
       const file = filesToUpload[i];
       const formData = new FormData();
       formData.append('file', file);
       formData.append('folder', 'tickets');

       try {
         // Note: we need to use fetch directly or update apiPost to handle FormData
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/uploads/file`, {
           method: 'POST',
           headers: {
             Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
           },
           body: formData
         });
         
         if (!res.ok) throw new Error('Upload falhou');
         
         const data = await res.json();
         uploadedUrls.push(data.url);

         // Atualizar estado local
         setFiles((prev) => {
           const updated = [...prev];
           const placeholderIdx = updated.findIndex((f) => f.uploading);
           if (placeholderIdx !== -1) {
             updated[placeholderIdx] = { url: data.url, uploading: false };
           }
           return updated;
         });
       } catch (error) {
         console.error('Erro no upload:', error);
         setFiles((prev) => prev.filter((_, idx) => idx !== prev.length - 1)); // Remover o que falhou
       }
    }

    onUpload(uploadedUrls);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (variant === 'icon') {
    return (
      <>
        <div className={className} onClick={() => fileInputRef.current?.click()}>
          {children}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple={maxFiles > 1}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <label className="text-sm font-medium text-slate-300">{label}</label>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AnimatePresence>
          {files.map((file, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-900"
            >
              {file.uploading ? (
                <div className="flex h-full flex-col items-center justify-center space-y-2">
                  <Loader2 className="animate-spin text-cyan-500" size={24} />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Enviando...</span>
                </div>
              ) : (
                <>
                  <img src={file.url} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {files.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center space-y-2 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/5"
          >
            <div className="rounded-full bg-white/5 p-3 text-slate-400">
              <Camera size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">Subir ou Tirar Foto</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
