'use client';

import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface Step3TechFormProps {
  acceptTerms: boolean;
  setAcceptTerms: (val: boolean) => void;
  isPending: boolean;
  errorMsg: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function Step3TechForm({
  acceptTerms,
  setAcceptTerms,
  isPending,
  errorMsg,
  onBack,
  onSubmit,
}: Step3TechFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (acceptTerms && !isPending) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Selo de Credibilidade
        </h2>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">
          Adicione certificados e feche mais negócios.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Container (Visual Mockup) */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/20 p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-500/30 hover:bg-slate-100 dark:hover:bg-zinc-900/40 cursor-pointer transition-all duration-300">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Upload de Certificados
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Formatos suportados: .jpg, .png, .pdf
          </p>
        </div>

        {/* Benefits details */}
        <div className="flex items-center gap-4 rounded-2xl bg-indigo-500/[0.04] dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/25 p-5 backdrop-blur-md">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-indigo-200 font-medium">
            Documentação correta aumenta sua visibilidade em até{' '}
            <strong className="text-indigo-600 dark:text-white font-bold">
              80% no marketplace
            </strong>
            , garantindo mais segurança aos clientes.
          </p>
        </div>

        {/* LGPD — Consentimento Explícito */}
        <label
          className={`flex items-start gap-3 cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
            acceptTerms
              ? 'border-emerald-500/50 bg-emerald-500/[0.04] dark:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.03)]'
              : 'border-slate-200/60 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/10 hover:border-slate-300 dark:hover:border-zinc-700/80'
          }`}
        >
          <input
            id="accept-terms-tech"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500 cursor-pointer"
          />
          <span className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            Li e aceito os{' '}
            <Link href="/legal" target="_blank" className="font-bold text-indigo-500 hover:underline">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/legal" target="_blank" className="font-bold text-indigo-500 hover:underline">
              Política de Privacidade (LGPD)
            </Link>
            . Autorizo o tratamento dos meus dados pessoais conforme descrito na política.
          </span>
        </label>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/25 text-xs font-semibold text-rose-600 dark:text-rose-400 backdrop-blur-md">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-transparent px-6 py-4 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          type="submit"
          disabled={isPending || !acceptTerms}
          className="btn-primary flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isPending ? 'Validando...' : 'Finalizar Cadastro'}{' '}
          <CheckCircle2 size={16} className={isPending ? 'hidden' : ''} />
        </button>
      </div>
    </form>
  );
}
