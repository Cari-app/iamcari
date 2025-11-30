import { Camera, Utensils, Heart, Clock, Droplet, Scale, BrainCircuit, Star, Edit, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEntry, EMOTION_TAGS } from '@/types';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  onEdit?: () => void;
  onRefresh?: () => void;
}

export function TimelineEntryCard({ entry, onEdit, onRefresh }: TimelineEntryCardProps) {
  // Meal Entry Card
  if (entry.type === 'meal') {
    // Consider it analyzed if we have ai_analysis, regardless of status field
    const hasAnalysis = typeof entry.ai_analysis === 'string' && entry.ai_analysis.trim().length > 0;
    const isPending = !hasAnalysis && (entry.status === 'pending' || entry.image_url);
    const isAnalyzed = hasAnalysis;
    
    return (
      <div className="p-4 bg-card border border-border rounded-2xl relative group">
        {!isPending && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {entry.entry_method === 'ai' && entry.image_url && onRefresh && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                className="h-8 w-8 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity press-effect"
                aria-label="Atualizar análise"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-8 w-8 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity press-effect"
                aria-label="Editar refeição"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
            entry.entry_method === 'ai' ? 'gradient-primary' : 'bg-muted'
          )}>
            {entry.entry_method === 'ai' ? (
              <Camera className="h-5 w-5 text-white" />
            ) : (
              <Utensils className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground tabular-nums">
                  {entry.time}
                </span>
              </div>
              {isPending ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-xs font-medium">
                  <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                  Processando
                </span>
              ) : entry.is_emotional ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-xs font-medium">
                  <Heart className="h-3 w-3" />
                  Emocional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-medium">
                  <Star className="h-3 w-3 fill-secondary" />
                  Planejada
                </span>
              )}
            </div>
            
            {hasAnalysis ? (
              <div className="mt-2 space-y-2">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {typeof entry.ai_analysis === 'string' ? entry.ai_analysis : ''}
                  </p>
                </div>
                {entry.calories > 0 && (
                  <p className="text-xs text-muted-foreground tabular-nums">
                    Total: {entry.calories} kcal
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className={cn(
                  'mt-1.5 font-medium leading-snug line-clamp-2',
                  isPending ? 'text-muted-foreground italic' : 'text-foreground'
                )}>
                  {entry.food_name}
                </p>
                {entry.calories > 0 && (
                  <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                    {entry.calories} kcal
                  </p>
                )}
              </>
            )}
            
            {entry.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img 
                  src={entry.image_url} 
                  alt="Foto da refeição" 
                  className="w-full h-auto max-h-48 object-cover"
                />
              </div>
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
      <div className="p-3.5 bg-card border border-border rounded-2xl relative overflow-hidden">
        {/* Left accent bar */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
        )} />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/20 flex-shrink-0">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                Sentindo-se
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium border',
                emotionData?.color || 'bg-muted text-muted-foreground'
              )}>
                {emotionData?.label || entry.emotion_tag}
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
      <div className="px-4 py-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <Droplet className="h-4 w-4 text-sky-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-sky-400 tabular-nums">
            {entry.value}ml
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-sky-400/60" />
            <span className="text-xs text-sky-400/60 tabular-nums">
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
      <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <Scale className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold text-emerald-400">
            Peso registrado: <span className="tabular-nums">{entry.value}kg</span>
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-emerald-400/60" />
            <span className="text-xs text-emerald-400/60 tabular-nums">
              {entry.time}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
