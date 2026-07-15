'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  className?: string;
  disabled?: boolean;
}

export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  className = '',
  disabled = false,
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`relative w-full ${className}`}>
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder=" "
        className={`peer floating-input w-full pr-10 border transition-all duration-300 ${
          error
            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-200/80 focus:border-blue-500 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      <label
        htmlFor={id}
        className="floating-label ml-1 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10 p-1"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}

      {error && (
        <p className="text-[10px] ml-4 mt-1.5 font-bold text-rose-500 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
