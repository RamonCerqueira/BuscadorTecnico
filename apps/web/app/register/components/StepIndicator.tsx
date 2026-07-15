'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepIndicatorProps {
  step: number;
  totalSteps: number;
}

export default function StepIndicator({ step, totalSteps }: StepIndicatorProps) {
  const percentage = totalSteps > 1 ? ((step - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="relative flex items-center justify-between mb-12">
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-full z-0" />
      
      {/* Active Line (with Premium Violet/Indigo Gradient) */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full z-0 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />

      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
        const isCompleted = step > s;
        const isActive = step === s;
        const isReached = step >= s;

        return (
          <div key={s} className="relative z-10 bg-white dark:bg-[#0a0a0a] px-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                isReached
                  ? 'border-indigo-500 bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                  : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-400 dark:text-zinc-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={16} className="text-white" />
              ) : (
                <span className="text-xs font-bold">{s}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
