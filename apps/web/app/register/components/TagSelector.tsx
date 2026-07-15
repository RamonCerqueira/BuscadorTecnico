'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagSelectorProps {
  specialties: string[];
  setSpecialties: (tags: string[]) => void;
}

export default function TagSelector({ specialties, setSpecialties }: TagSelectorProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = newTag.trim();
    if (cleanTag && !specialties.includes(cleanTag)) {
      setSpecialties([...specialties, cleanTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSpecialties(specialties.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 ml-1">
        Especialidades (Tags)
      </label>
      <div className="flex gap-4">
        <input
          type="text"
          className="input-field"
          placeholder="Ex: Instalação de Split, Eletricista, DryWall..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <button
          type="button"
          onClick={() => addTag()}
          className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 active:scale-95 transition-all duration-300"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {specialties.length === 0 ? (
          <span className="text-xs text-slate-400 dark:text-zinc-500 ml-1">
            Nenhuma especialidade adicionada ainda.
          </span>
        ) : (
          specialties.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-700 dark:text-zinc-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-0.5 rounded-full focus:outline-none"
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
