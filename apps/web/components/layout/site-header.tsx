'use client';

import Link from 'next/link';
import { useSessionStore } from '@/lib/store';
import { Bell, User, LogOut, LayoutDashboard, Sun, Moon, Menu, X, Server } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ui/theme-provider';

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
};

export function SiteHeader() {
  const { token, clearSession } = useSessionStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiGet<Notification[]>('/notifications'),
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30s
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        {/* Sleek Geometric Layered Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50 transition-all duration-300"
        >
          <div className="h-8 w-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-105 transition-transform duration-300">
            <svg
              className="h-4.5 w-4.5 text-white dark:text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-bold">
            Tech
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Fix
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <Link
              href="/companies"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Profissionais
            </Link>
            <Link
              href="/opportunities"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Oportunidades
            </Link>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800/80 mx-2" />

          {token ? (
            <div className="flex items-center gap-6">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200"
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
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 p-2 shadow-xl backdrop-blur-xl z-50"
                    >
                      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                          Notificações
                        </span>
                        <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase">
                          Limpar tudo
                        </button>
                      </div>
                      <div className="max-h-[260px] overflow-y-auto">
                        {notifications?.length === 0 ? (
                          <div className="p-8 text-center text-xs text-zinc-400 font-bold">
                            Nenhum alerta novo
                          </div>
                        ) : (
                          notifications?.map((n) => (
                            <div
                              key={n.id}
                              className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 rounded-xl transition-colors duration-200"
                            >
                              <h5 className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 mb-1">
                                {n.title}
                              </h5>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center p-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 border-t border-zinc-100 dark:border-zinc-800/60"
                      >
                        Ver painel completo
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Console Dashboard button */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-xs font-semibold hover:opacity-90 active:scale-98 transition-all duration-200 shadow-sm"
              >
                <LayoutDashboard size={13} /> Painel
              </Link>

              <button
                onClick={clearSession}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-200"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-zinc-100 px-2"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 px-5 py-2 text-xs font-semibold tracking-wide hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.97] transition-all duration-200 shadow-sm"
              >
                Começar
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          {token && (
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-all duration-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/60 overflow-hidden z-50"
          >
            <div className="flex flex-col p-6 gap-6 h-full font-sans">
              <Link
                href="/companies"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 transition-colors"
              >
                Profissionais
              </Link>
              <Link
                href="/opportunities"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 transition-colors"
              >
                Oportunidades
              </Link>

              <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/80 my-2" />

              {token ? (
                <div className="flex flex-col gap-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-semibold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 transition-colors"
                  >
                    <LayoutDashboard size={18} /> Painel de Controle
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      clearSession();
                    }}
                    className="flex items-center gap-3 text-base font-semibold text-rose-500 hover:text-rose-400 transition-colors text-left"
                  >
                    <LogOut size={18} /> Sair da Conta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full rounded-full bg-zinc-100 dark:bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full rounded-full bg-zinc-950 dark:bg-zinc-50 px-6 py-3.5 text-sm font-semibold text-white dark:text-zinc-950 transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
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
