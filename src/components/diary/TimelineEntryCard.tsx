import { Camera, Pencil, Heart, Clock, Droplet, Scale, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEntry, EMOTION_TAGS } from '@/types';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
}

export function TimelineEntryCard({ entry }: TimelineEntryCardProps) {
  // Meal Entry Card
  if (entry.type === 'meal') {
    return (
      <div className="p-4 border border-border">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
            entry.entry_method === 'ai' ? 'gradient-primary' : 'bg-muted'
          )}>
            {entry.entry_method === 'ai' ? (
              <Camera className="h-5 w-5 text-white" />
            ) : (
              <Pencil className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground tabular-nums">
                {entry.time}
              </span>
              {entry.is_emotional && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                  <Heart className="h-3 w-3" />
                  Emocional
                </span>
              )}
            </div>
            <p className="mt-1 text-foreground font-medium truncate">
              {entry.food_name}
            </p>
            {entry.calories && (
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.calories} kcal
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mood Entry Card
  if (entry.type === 'mood') {
    const emotionData = EMOTION_TAGS.find(e => e.value === entry.emotion_tag);
    const isPositive = ['calmo', 'focado', 'feliz', 'energizado'].includes(entry.emotion_tag || '');
    
    return (
      <div className={cn(
        'p-3 border-l-4 border border-border',
        isPositive ? 'border-l-emerald-500' : 'border-l-rose-500'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/20 flex-shrink-0">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Sentindo-se{' '}
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  emotionData?.color || 'bg-muted'
                )}>
                  {emotionData?.label || entry.emotion_tag}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground tabular-nums">
                {entry.time}
              </span>
              <span className="text-xs text-muted-foreground">
                • Energia: {entry.mood_score}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Water Entry Card
  if (entry.type === 'water') {
    return (
      <div className="px-4 py-2.5 bg-sky-500/10 border border-sky-500/20">
        <div className="flex items-center gap-3">
          <Droplet className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-medium text-sky-400">
            {entry.value}ml
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {entry.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Weight Entry Card
  if (entry.type === 'weight') {
    return (
      <div className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <Scale className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">
            Peso registrado: {entry.value}kg
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {entry.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
