// LeveStay Type Definitions

export interface Profile {
  id: string;
  whatsapp_number: string;
  token_balance: number;
  tier: 'free' | 'premium';
  created_at?: string;
  updated_at?: string;
}

export interface FastingSession {
  id: string;
  user_id: string;
  start_time: string; // ISO timestamp
  end_time: string | null; // ISO timestamp, null if active
  target_hours: number;
  created_at?: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  image_url: string | null;
  ai_analysis: AIAnalysis | null;
  hunger_level: number; // 1-10
  is_emotional: boolean;
  description?: string;
  created_at: string;
}

export interface AIAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  foods: string[];
  health_score: number; // 1-10
  suggestions?: string[];
}

export type FastingPhase = 'fed' | 'fasting' | 'ketosis' | 'autophagy' | 'deep-autophagy';

export interface FastingPhaseInfo {
  label: string;
  color: string;
  description: string;
  minHours: number;
}

export const FASTING_PHASES: Record<FastingPhase, FastingPhaseInfo> = {
  'fed': {
    label: 'Alimentado',
    color: 'text-muted-foreground',
    description: 'Seu corpo está digerindo os alimentos',
    minHours: 0,
  },
  'fasting': {
    label: 'Jejum Inicial',
    color: 'text-primary',
    description: 'Glicose sendo consumida como energia',
    minHours: 4,
  },
  'ketosis': {
    label: 'Cetose',
    color: 'text-secondary',
    description: 'Corpo começando a queimar gordura',
    minHours: 12,
  },
  'autophagy': {
    label: 'Autofagia',
    color: 'text-teal',
    description: 'Renovação celular ativa',
    minHours: 16,
  },
  'deep-autophagy': {
    label: 'Autofagia Profunda',
    color: 'text-violet',
    description: 'Máxima regeneração celular',
    minHours: 24,
  },
};
