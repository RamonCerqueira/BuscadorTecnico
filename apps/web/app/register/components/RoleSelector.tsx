'use client';

import React from 'react';
import { User, Settings, ShieldCheck } from 'lucide-react';

export type UserType = 'client' | 'technician' | 'company';

interface RoleSelectorProps {
  userType: UserType;
  setUserType: (type: UserType) => void;
}

export default function RoleSelector({ userType, setUserType }: RoleSelectorProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const profiles = [
    {
      id: 'client' as UserType,
      label: 'Cliente',
      desc: 'Para quem precisa de serviços de reparo e manutenção com IA.',
      icon: <User size={20} />,
    },
    {
      id: 'technician' as UserType,
      label: 'Técnico',
      desc: 'Para autônomos que desejam receber e gerenciar chamados.',
      icon: <Settings size={20} />,
    },
    {
      id: 'company' as UserType,
      label: 'Empresa',
      desc: 'Para empresas de assistência e equipes técnicas estruturadas.',
      icon: <ShieldCheck size={20} />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {profiles.map((profile) => {
        const isSelected = userType === profile.id;
        return (
          <button
            key={profile.id}
            type="button"
            onClick={() => setUserType(profile.id)}
            onMouseMove={handleMouseMove}
            className={`glow-card-container relative rounded-2xl p-4 text-center transition-all duration-300 border flex flex-col items-center justify-between min-h-[140px] ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-[0_0_16px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                : 'border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 hover:border-indigo-300 dark:hover:border-zinc-700/80'
            }`}
          >
            <div className="glow-card-border" />
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                }`}
              >
                {profile.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {profile.label}
              </h3>
              <p className="mt-1.5 text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                {profile.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
