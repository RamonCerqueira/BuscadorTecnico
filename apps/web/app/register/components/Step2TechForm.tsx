'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import FloatingInput from './FloatingInput';
import TagSelector from './TagSelector';
import { UserType } from './RoleSelector';

interface Step2TechFormProps {
  userType: UserType;
  document: string;
  setDocument: (val: string) => void;
  zipCode: string;
  setZipCode: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  stateStr: string;
  setStateStr: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  specialties: string[];
  setSpecialties: (tags: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function Step2TechForm({
  userType,
  document,
  setDocument,
  zipCode,
  setZipCode,
  address,
  setAddress,
  city,
  setCity,
  stateStr,
  setStateStr,
  bio,
  setBio,
  specialties,
  setSpecialties,
  onBack,
  onNext,
}: Step2TechFormProps) {
  const handleDocumentChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (userType === 'technician') {
      // CPF: 999.999.999-99
      clean = clean.substring(0, 11);
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 99.999.999/9999-99
      clean = clean.substring(0, 14);
      clean = clean.replace(/(\d{2})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d)/, '$1.$2');
      clean = clean.replace(/(\d{3})(\d)/, '$1/$2');
      clean = clean.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    setDocument(clean);
  };

  const handleZipCodeChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    clean = clean.substring(0, 8);
    clean = clean.replace(/(\d{5})(\d)/, '$1-$2');
    setZipCode(clean);
  };

  const isFormValid =
    document.trim() !== '' &&
    zipCode.trim() !== '' &&
    address.trim() !== '' &&
    city.trim() !== '' &&
    stateStr.trim() !== '' &&
    bio.trim() !== '' &&
    specialties.length > 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Seu Perfil no TechFix
        </h2>
        <p className="mt-2 text-slate-500 dark:text-zinc-400">
          Descreva sua trajetória e atraia mais clientes.
        </p>
      </div>

      <div className="space-y-4">
        <FloatingInput
          id="document"
          label={userType === 'company' ? 'CNPJ' : 'CPF'}
          value={document}
          onChange={handleDocumentChange}
        />

        <FloatingInput
          id="zipCode"
          label="CEP"
          value={zipCode}
          onChange={handleZipCodeChange}
        />

        <FloatingInput
          id="address"
          label="Endereço (Rua, Número)"
          value={address}
          onChange={setAddress}
        />

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="city"
            label="Cidade"
            value={city}
            onChange={setCity}
          />
          <FloatingInput
            id="stateStr"
            label="Estado"
            value={stateStr}
            onChange={setStateStr}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 ml-1">
            Sua Biografia & Diferenciais
          </label>
          <textarea
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-black/40 p-4 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-300 min-h-[120px] resize-none"
            placeholder="Fale sobre seus anos de experiência, ferramentas de ponta que utiliza e como garante a satisfação do cliente..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <TagSelector specialties={specialties} setSpecialties={setSpecialties} />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-transparent px-6 py-4 text-sm font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className="btn-primary flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300"
        >
          Próximo Passo <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
