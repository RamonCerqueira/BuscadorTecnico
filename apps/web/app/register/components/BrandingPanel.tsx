'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Activity, Cpu, Globe, Server, Building, TrendingUp } from 'lucide-react';
import { UserType } from './RoleSelector';

interface BrandingPanelProps {
  userType: UserType;
}

export default function BrandingPanel({ userType }: BrandingPanelProps) {
  // System logs simulation
  const getLogs = (type: UserType) => {
    switch (type) {
      case 'client':
        return [
          { time: '15:10:02', event: 'GEOLOC_SCAN', msg: 'Escaneando técnicos próximos...', status: 'info' },
          { time: '15:10:03', event: 'MATCH_ENGINE', msg: 'Técnico certificado Carlos S. localizado a 500m.', status: 'success' },
          { time: '15:10:04', event: 'ESCROW_INIT', msg: 'Garantia de pagamento (Escrow) criada: R$ 150,00.', status: 'warning' },
          { time: '15:10:05', event: 'SYS_SECURE', msg: 'Transação protegida e auditada via blockchain.', status: 'success' },
        ];
      case 'technician':
        return [
          { time: '15:10:02', event: 'CORE_INIT', msg: 'Console de serviço ativo. Modo: Autônomo.', status: 'success' },
          { time: '15:10:03', event: 'AI_PARSER', msg: 'Analisando fotos do chamado #9240 via IA...', status: 'info' },
          { time: '15:10:04', event: 'DIAGNOSTIC', msg: 'Diagnóstico IA: Sobrecarga em disjuntor principal.', status: 'success' },
          { time: '15:10:05', event: 'ESCROW_HELD', msg: 'Pagamento total de R$ 1.850,00 bloqueado em garantia.', status: 'warning' },
        ];
      case 'company':
        return [
          { time: '15:10:02', event: 'B2B_SERVER', msg: 'Servidor corporativo iniciado.', status: 'success' },
          { time: '15:10:03', event: 'DISPATCHER', msg: 'Roteador inteligente ativo para 5 técnicos.', status: 'info' },
          { time: '15:10:04', event: 'SPLIT_FLOW', msg: 'Split financeiro pronto: 15% taxa plataforma.', status: 'success' },
          { time: '15:10:05', event: 'METRICS_OK', msg: 'Sincronização de faturamento e notas fiscais completa.', status: 'success' },
        ];
    }
  };

  const currentLogs = getLogs(userType);

  return (
    <section className="hidden lg:flex flex-col justify-between p-16 relative overflow-hidden bg-[#07070a] border-r border-zinc-900 z-10">
      {/* Premium Fine Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Ultra-Soft Glow Accents */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <span className="text-[11px] font-black text-white tracking-widest">T</span>
          </div>
          <span className="text-xs font-black tracking-[0.2em] text-white uppercase font-mono">
            TechFix // OS
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
          <Server size={10} className="text-indigo-400 animate-pulse" /> CLOUD v2.6.4
        </div>
      </div>

      {/* Center Hero Info */}
      <div className="relative z-10 space-y-6 max-w-lg my-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 font-mono">
          <Activity size={10} /> SISTEMA OPERACIONAL ATIVO
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15] text-zinc-50">
          {userType === 'client' ? (
            <>
              Ordem e transparência na <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                contratação técnica
              </span>{' '}
              com garantia.
            </>
          ) : userType === 'technician' ? (
            <>
              Potencialize sua atuação com <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                diagnósticos de IA
              </span>{' '}
              e autonomia.
            </>
          ) : (
            <>
              Console consolidado para <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                gestão de equipes B2B
              </span>
              .
            </>
          )}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
          {userType === 'client' ? (
            'Preencha seus chamados e tenha a inteligência artificial ao seu favor, analisando laudos técnicos e garantindo pagamentos seguros sob custódia.'
          ) : userType === 'technician' ? (
            'Receba chamados pré-analisados por nossa IA, formule propostas dinâmicas de visitas e gerencie seus recebíveis integrados.'
          ) : (
            'Monitore o deslocamento de equipes em campo, processe repasses e automatize as NFS-e de serviços centralizadamente.'
          )}
        </p>
      </div>

      {/* Code Window Widget (Ultra-Premium Interactive Preview) */}
      <div className="relative z-10 w-full max-w-xl group">
        {/* Glow behind the window */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-2xl blur-md opacity-75 transition duration-1000 group-hover:opacity-100" />
        
        {/* Window shell */}
        <div className="relative rounded-2xl border border-zinc-800 bg-[#0c0c0e]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Windows Header / Window controls */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-900 bg-zinc-950/80">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
              {userType === 'client'
                ? 'techfix-client-engine.sh'
                : userType === 'technician'
                ? 'techfix-ai-diagnostics.ts'
                : 'techfix-b2b-analytics.go'}
            </span>
            <div className="w-14" /> {/* spacer balance */}
          </div>

          {/* Window Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[220px]">
            {/* Visual Graphic Panel */}
            <div className="flex items-center justify-center bg-zinc-950/60 rounded-xl border border-zinc-900 overflow-hidden relative p-4">
              <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(12,12,14,0.8)_100%)] pointer-events-none z-10" />

              <AnimatePresence mode="wait">
                {userType === 'client' && (
                  <motion.div
                    key="client-graphics"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex flex-col justify-between"
                  >
                    <svg className="w-full h-24 text-indigo-500/20" viewBox="0 0 200 100">
                      {/* Connection Lines */}
                      <path d="M 30,50 L 100,20" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                      <path d="M 30,50 L 100,80" stroke="currentColor" strokeWidth="0.75" />
                      <path d="M 100,20 L 170,50" stroke="currentColor" strokeWidth="0.75" />
                      <path d="M 100,80 L 170,50" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                      
                      {/* Node Circles */}
                      <circle cx="30" cy="50" r="4" className="fill-indigo-500 text-indigo-400" />
                      <circle cx="100" cy="20" r="4" className="fill-zinc-800 text-zinc-500" />
                      <circle cx="100" cy="80" r="4" className="fill-zinc-800 text-zinc-500" />
                      <circle cx="170" cy="50" r="4" className="fill-violet-500 text-violet-400 animate-pulse" />

                      {/* Moving pulse indicator */}
                      <circle cx="100" cy="80" r="2" className="fill-indigo-400">
                        <animate attributeName="cx" values="30;100;170" dur="4s" repeatCount="indefinite" />
                        <animate attributeName="cy" values="50;80;50" dur="4s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                    <div className="flex items-center justify-between mt-2 border-t border-zinc-900 pt-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Globe size={11} className="text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">MATCHING SYSTEM</span>
                      </div>
                      <span className="text-[8px] font-mono font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                        GUARANTEED
                      </span>
                    </div>
                  </motion.div>
                )}

                {userType === 'technician' && (
                  <motion.div
                    key="tech-graphics"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                      <Cpu size={12} className="text-violet-400 animate-pulse" />
                      <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">AI DIAGNOSTICS PARSER</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center py-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                        <span>MODEL CAPACITOR SCAN</span>
                        <span className="text-indigo-400">98.2% ACC</span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: '98%' }} />
                      </div>
                      <p className="text-[8px] font-mono text-zinc-400 leading-tight">
                        &gt; status code: CAP_VOLT_ANOMALY [DETECTOR ON]
                      </p>
                    </div>
                  </motion.div>
                )}

                {userType === 'company' && (
                  <motion.div
                    key="company-graphics"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <Building size={11} className="text-blue-400" />
                        <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">B2B BILLING FORECAST</span>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingUp size={9} /> +12%
                      </span>
                    </div>
                    <svg className="w-full h-16 text-indigo-500/20" viewBox="0 0 200 60">
                      {/* Grid Lines */}
                      <line x1="0" y1="15" x2="200" y2="15" stroke="#1d1d22" strokeWidth="0.5" />
                      <line x1="0" y1="35" x2="200" y2="35" stroke="#1d1d22" strokeWidth="0.5" />
                      <line x1="0" y1="55" x2="200" y2="55" stroke="#1d1d22" strokeWidth="0.5" />
                      {/* Graph Path */}
                      <path
                        d="M 0,55 Q 30,45 60,35 T 120,20 T 180,5 Q 200,3 200,3"
                        fill="none"
                        stroke="url(#graphGrad)"
                        strokeWidth="1.5"
                      />
                      <defs>
                        <linearGradient id="graphGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Terminal Log Output */}
            <div className="flex flex-col justify-between font-mono text-[9px] leading-relaxed text-zinc-500 bg-[#060608] rounded-xl border border-zinc-900 p-4 overflow-hidden relative">
              <div className="absolute top-2 right-3 flex items-center gap-1">
                <Terminal size={10} className="text-zinc-600" />
                <span className="text-[8px] text-zinc-700 font-bold uppercase font-mono">LOG_STREAM</span>
              </div>
              <div className="space-y-1.5 flex-1 pr-4 max-h-[140px] overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {currentLogs.map((log, i) => (
                    <motion.div
                      key={log.event}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.2 }}
                      className="flex items-start gap-1.5"
                    >
                      <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                      <span
                        className={`font-black shrink-0 ${
                          log.status === 'success'
                            ? 'text-emerald-500/80'
                            : log.status === 'warning'
                            ? 'text-amber-500/80'
                            : 'text-indigo-400'
                        }`}
                      >
                        {log.event}:
                      </span>
                      <span className="text-zinc-400 line-clamp-1">{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Minimal Trust Badges (Replaced cheap review box) */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-8 gap-y-4 pt-12 border-t border-zinc-900/60 max-w-xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold mt-8">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-indigo-400" />
          <span>ESCROW PROTECTED // SECURE PAYMENTS</span>
        </div>
        <div className="flex items-center gap-2 border-l border-zinc-900 pl-8">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ALL NODE SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </section>
  );
}
