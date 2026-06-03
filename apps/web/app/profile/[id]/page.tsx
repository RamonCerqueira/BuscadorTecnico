'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/skeleton';

// Import Templates
import { ClientProfileTemplate } from '@/components/profile/templates/client-profile';
import { CompanyProfileTemplate } from '@/components/profile/templates/company-profile';
import { TechnicianProfileTemplate } from '@/components/profile/templates/technician-profile';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['professional', id],
    queryFn: () => apiGet<any>(`/users/${id}`),
    enabled: !!id,
    retry: 1,
  });

  const { data: portfolioItems, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => apiGet<any[]>(`/portfolio/user/${id}`),
    enabled: !!id && profile?.userType !== 'client',
  });

  if (isProfileLoading || (isPortfolioLoading && profile?.userType !== 'client')) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </main>
    );
  }

  if (profileError || !profile) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 text-center">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Perfil não encontrado</h1>
        <p className="text-slate-500 mb-8">O perfil que você está tentando acessar não existe ou foi removido.</p>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition-transform hover:scale-105"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </main>
    );
  }

  // Factory Render
  const renderTemplate = () => {
    switch (profile.userType) {
      case 'client':
        return <ClientProfileTemplate profile={profile} />;
      case 'company':
        return <CompanyProfileTemplate profile={profile} portfolioItems={portfolioItems || []} />;
      case 'technician':
      default:
        return <TechnicianProfileTemplate profile={profile} portfolioItems={portfolioItems || []} />;
    }
  };

  return (
    <main className="pb-20">
      {/* Navbar Minimalista / Back button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all border border-slate-300/40 dark:border-white/5 relative z-50"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>

      <div className="px-4 sm:px-6">
        {renderTemplate()}
      </div>
    </main>
  );
}
