'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { motion } from 'framer-motion';
import { 
  Users, 
  ClipboardCheck, 
  CreditCard, 
  ShieldCheck,
  Check,
  X,
  Search
} from 'lucide-react';
import { useState } from 'react';

type AdminStats = {
  totalUsers: number;
  totalTickets: number;
  activeSubscriptions: number;
  techniciansCount: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  userType: string;
  subscriptionActive: boolean;
  createdAt: string;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiGet<AdminStats>('/admin/stats')
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiGet<User[]>('/admin/users')
  });

  const toggleSubMutation = useMutation({
    mutationFn: (userId: string) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/toggle-subscription`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('buscador-session') || '{}').state?.token}`
        }
    }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const stats = statsQuery.data;
  const users = usersQuery.data?.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="text-cyan-500" size={32} /> Central Administrativa
        </h1>
        <p className="text-slate-400">Gerencie a plataforma e acompanhe o crescimento.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {[
          { label: 'Total Usuários', value: stats?.totalUsers, icon: Users, color: 'text-blue-400' },
          { label: 'Chamados', value: stats?.totalTickets, icon: ClipboardCheck, color: 'text-emerald-400' },
          { label: 'Assinaturas Ativas', value: stats?.activeSubscriptions, icon: CreditCard, color: 'text-cyan-400' },
          { label: 'Técnicos', value: stats?.techniciansCount, icon: ShieldCheck, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-3xl font-bold">{stat.value ?? '...'}</p>
          </motion.div>
        ))}
      </section>

      {/* User Management */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Gestão de Usuários</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-cyan-500 outline-none"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 font-semibold text-slate-400">Usuário</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Tipo</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Status Assinatura</th>
                  <th className="px-6 py-4 font-semibold text-slate-400">Desde</th>
                  <th className="px-6 py-4 font-semibold text-slate-400 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-400">{user.userType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.subscriptionActive 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {user.subscriptionActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {(user.userType === 'technician' || user.userType === 'company') && (
                         <button 
                            onClick={() => toggleSubMutation.mutate(user.id)}
                            className={`p-2 rounded-lg transition-all ${
                              user.subscriptionActive 
                                ? 'text-rose-400 hover:bg-rose-400/10' 
                                : 'text-emerald-400 hover:bg-emerald-400/10'
                            }`}
                            title={user.subscriptionActive ? "Remover Assinatura" : "Ativar Assinatura"}
                         >
                           {user.subscriptionActive ? <X size={20} /> : <Check size={20} />}
                         </button>
                       )}
                    </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
