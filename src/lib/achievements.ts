import { Flame, Droplet, Scale, Timer, Trophy, Zap, Target, Heart, LucideIcon } from 'lucide-react';

export type AchievementTier = 'bronze' | 'silver' | 'gold';

export interface AchievementDefinition {
  key: string;
  category: 'fasting' | 'water' | 'weight';
  icon: LucideIcon;
  title: string;
  tiers: {
    bronze: { label: string; requirement: number };
    silver: { label: string; requirement: number };
    gold: { label: string; requirement: number };
  };
  /** Function to evaluate progress from raw data */
  evaluate: (data: AchievementData) => number;
}

export interface AchievementData {
  totalFasts: number;
  fastingStreak: number;
  longestFastHours: number;
  totalFastingHours: number;
  totalWaterLogs: number;
  waterStreak: number;
  totalWeightLogs: number;
  weightStreak: number;
  weightLostKg: number;
}

export interface UnlockedAchievement {
  key: string;
  tier: AchievementTier;
  unlocked_at: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // === FASTING ===
  {
    key: 'first_fast',
    category: 'fasting',
    icon: Flame,
    title: 'Primeiro Jejum',
    tiers: {
      bronze: { label: 'Complete 1 jejum', requirement: 1 },
      silver: { label: 'Complete 5 jejuns', requirement: 5 },
      gold: { label: 'Complete 20 jejuns', requirement: 20 },
    },
    evaluate: (d) => d.totalFasts,
  },
  {
    key: 'fasting_streak',
    category: 'fasting',
    icon: Zap,
    title: 'Sequência de Jejum',
    tiers: {
      bronze: { label: '3 dias seguidos', requirement: 3 },
      silver: { label: '7 dias seguidos', requirement: 7 },
      gold: { label: '30 dias seguidos', requirement: 30 },
    },
    evaluate: (d) => d.fastingStreak,
  },
  {
    key: 'long_fast',
    category: 'fasting',
    icon: Timer,
    title: 'Jejum Longo',
    tiers: {
      bronze: { label: 'Jejum de 16h', requirement: 16 },
      silver: { label: 'Jejum de 20h', requirement: 20 },
      gold: { label: 'Jejum de 24h', requirement: 24 },
    },
    evaluate: (d) => d.longestFastHours,
  },
  {
    key: 'total_hours',
    category: 'fasting',
    icon: Trophy,
    title: 'Horas Acumuladas',
    tiers: {
      bronze: { label: '50 horas de jejum', requirement: 50 },
      silver: { label: '200 horas de jejum', requirement: 200 },
      gold: { label: '500 horas de jejum', requirement: 500 },
    },
    evaluate: (d) => d.totalFastingHours,
  },
  // === WATER ===
  {
    key: 'hydration_start',
    category: 'water',
    icon: Droplet,
    title: 'Hidratação',
    tiers: {
      bronze: { label: 'Registre água 1 vez', requirement: 1 },
      silver: { label: 'Registre água 30 vezes', requirement: 30 },
      gold: { label: 'Registre água 100 vezes', requirement: 100 },
    },
    evaluate: (d) => d.totalWaterLogs,
  },
  {
    key: 'water_streak',
    category: 'water',
    icon: Droplet,
    title: 'Sequência de Água',
    tiers: {
      bronze: { label: '3 dias seguidos', requirement: 3 },
      silver: { label: '7 dias seguidos', requirement: 7 },
      gold: { label: '30 dias seguidos', requirement: 30 },
    },
    evaluate: (d) => d.waterStreak,
  },
  // === WEIGHT ===
  {
    key: 'weight_tracker',
    category: 'weight',
    icon: Scale,
    title: 'Rastreador de Peso',
    tiers: {
      bronze: { label: 'Registre peso 1 vez', requirement: 1 },
      silver: { label: 'Registre peso 15 vezes', requirement: 15 },
      gold: { label: 'Registre peso 50 vezes', requirement: 50 },
    },
    evaluate: (d) => d.totalWeightLogs,
  },
  {
    key: 'weight_loss',
    category: 'weight',
    icon: Target,
    title: 'Perda de Peso',
    tiers: {
      bronze: { label: 'Perca 1kg', requirement: 1 },
      silver: { label: 'Perca 5kg', requirement: 5 },
      gold: { label: 'Perca 10kg', requirement: 10 },
    },
    evaluate: (d) => d.weightLostKg,
  },
  {
    key: 'weight_consistency',
    category: 'weight',
    icon: Heart,
    title: 'Consistência de Peso',
    tiers: {
      bronze: { label: '3 dias seguidos', requirement: 3 },
      silver: { label: '7 dias seguidos', requirement: 7 },
      gold: { label: '30 dias seguidos', requirement: 30 },
    },
    evaluate: (d) => d.weightStreak,
  },
];

export function getTierColor(tier: AchievementTier) {
  switch (tier) {
    case 'bronze': return 'text-amber-600 dark:text-amber-500';
    case 'silver': return 'text-slate-400 dark:text-slate-300';
    case 'gold': return 'text-yellow-500 dark:text-yellow-400';
  }
}

export function getTierBg(tier: AchievementTier) {
  switch (tier) {
    case 'bronze': return 'bg-amber-500/15 border-amber-500/30';
    case 'silver': return 'bg-slate-400/15 border-slate-400/30';
    case 'gold': return 'bg-yellow-500/15 border-yellow-500/30';
  }
}

export function getTierLabel(tier: AchievementTier) {
  switch (tier) {
    case 'bronze': return 'Bronze';
    case 'silver': return 'Prata';
    case 'gold': return 'Ouro';
  }
}

/** Calculate which tiers should be unlocked for each achievement */
export function calculateUnlocks(data: AchievementData): { key: string; tier: AchievementTier }[] {
  const unlocks: { key: string; tier: AchievementTier }[] = [];
  const tiers: AchievementTier[] = ['bronze', 'silver', 'gold'];

  for (const achievement of ACHIEVEMENTS) {
    const value = achievement.evaluate(data);
    for (const tier of tiers) {
      if (value >= achievement.tiers[tier].requirement) {
        unlocks.push({ key: achievement.key, tier });
      }
    }
  }

  return unlocks;
}
