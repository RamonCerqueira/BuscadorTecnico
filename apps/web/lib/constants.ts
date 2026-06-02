import { 
  Wind, 
  Zap, 
  Droplets, 
  HardHat, 
  Monitor,
  Settings,
  Box,
  Paintbrush,
  Plus,
  Clock,
  Sparkles
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'Ar Condicionado', icon: Wind, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'Elétrica', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'Hidráulica', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'Reformas', icon: HardHat, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'Informática', icon: Monitor, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'Eletrodomésticos', icon: Settings, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'Montagem', icon: Box, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'Pintura', icon: Paintbrush, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'Outros', icon: Plus, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export const URGENCIES = [
  { id: 'Emergência', label: 'Preciso para Agora!', icon: Zap, color: 'text-rose-500', border: 'border-rose-500/30' },
  { id: 'Nas próximas 24h', label: 'Hoje ou Amanhã', icon: Clock, color: 'text-amber-500', border: 'border-amber-500/30' },
  { id: 'Flexível', label: 'Sem Pressa', icon: Sparkles, color: 'text-blue-500', border: 'border-blue-500/30' },
];
