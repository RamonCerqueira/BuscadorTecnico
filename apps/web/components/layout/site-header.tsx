'use client';

import Link from 'next/link';
import { useSessionStore } from '@/lib/store';
import { Bell, User, LogOut, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ui/theme-provider';

export function SiteHeader() {
  const { token, clearSession, userType } = useSessionStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiGet<any[]>('/notifications'),
    enabled: !!token,
    refetchInterval: 30000 // Refresh every 30s
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-black/60 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 dark:text-white transition-all">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs text-white shadow-xl shadow-blue-600/20 group-hover:rotate-6 transition-transform">
            TF
          </div>
          <span>Tech<span className="text-blue-600">Fix</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-8 mr-4">
            <Link href="/companies" className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/40 transition hover:text-blue-600 dark:hover:text-white">
              Profissionais
            </Link>
            <Link href="/opportunities" className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/40 transition hover:text-blue-600 dark:hover:text-white">
              Oportunidades
            </Link>
          </div>

          {token ? (
            <div className="flex items-center gap-6">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isDark ? 'moon' : 'sun'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-black">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] p-2 shadow-2xl shadow-blue-600/10"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest">Notificações</span>
                        <button className="text-[10px] font-black text-blue-600 uppercase">Limpar tudo</button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications?.length === 0 ? (
                           <div className="p-8 text-center text-xs text-slate-400 font-bold">Nenhum alerta novo</div>
                        ) : (
                          notifications?.map(n => (
                            <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                              <h5 className="text-[10px] font-black uppercase text-blue-600 mb-1">{n.title}</h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link href="/dashboard" className="block text-center p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 border-t border-slate-100 dark:border-white/5">
                        Ver painel completo
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/dashboard"
                className="flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-5 py-2.5 text-xs font-black text-white dark:text-black hover:opacity-90 transition-all"
              >
                <LayoutDashboard size={14} /> Painel
              </Link>
              
              <button 
                onClick={clearSession}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white px-4 hover:text-blue-600 transition-colors">Entrar</Link>
               <Link 
                 href="/register" 
                 className="rounded-2xl bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all"
               >
                 Começar
               </Link>
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex lg:hidden items-center gap-4">
          {token && (
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-black">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-900 dark:text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-white dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6 h-full">
              <Link 
                href="/companies" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white"
              >
                Profissionais
              </Link>
              <Link 
                href="/opportunities" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white"
              >
                Oportunidades
              </Link>
              
              <div className="h-px w-full bg-slate-100 dark:bg-white/10 my-2" />

              {token ? (
                <>
                  <Link 
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-black text-slate-900 dark:text-white"
                  >
                    <LayoutDashboard size={20} /> Painel de Controle
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      clearSession();
                    }}
                    className="flex items-center gap-3 text-lg font-black text-rose-500"
                  >
                    <LogOut size={20} /> Sair da Conta
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full rounded-2xl bg-slate-100 dark:bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all"
                  >
                    Entrar
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                  >
                    Começar
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

