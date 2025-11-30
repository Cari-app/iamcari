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

// Timeline Entry Types for Holistic Health Diary
export type LogType = 'meal' | 'mood' | 'water' | 'weight';

export type EmotionTag = 'ansioso' | 'focado' | 'estressado' | 'calmo' | 'feliz' | 'triste' | 'energizado' | 'cansado';

export interface TimelineEntry {
  id: string;
  user_id?: string;
  type: LogType;
  created_at: string; // ISO Timestamp
  time: string; // Display time HH:mm
  
  // Meal Props
  image_url?: string;
  calories?: number;
  food_name?: string;
  is_emotional?: boolean;
  hunger_level?: number;
  entry_method?: 'ai' | 'manual';
  ai_analysis?: AIAnalysis | string;
  status?: 'manual' | 'pending' | 'analyzed' | 'error';
  
  // Mood Props
  mood_score?: number; // 1-10
  emotion_tag?: EmotionTag;
  
  // Water/Weight Props
  value?: number; // ml or kg
}

export const EMOTION_TAGS: { value: EmotionTag; label: string; color: string }[] = [
  { value: 'calmo', label: 'Calmo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'focado', label: 'Focado', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { value: 'feliz', label: 'Feliz', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'energizado', label: 'Energizado', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { value: 'ansioso', label: 'Ansioso', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'estressado', label: 'Estressado', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { value: 'cansado', label: 'Cansado', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'triste', label: 'Triste', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
];
