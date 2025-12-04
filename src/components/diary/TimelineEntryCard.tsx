import { Camera, Utensils, Heart, Clock, Droplet, Scale, BrainCircuit, Star, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEntry, EMOTION_TAGS } from '@/types';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  onEdit?: () => void;
}

export function TimelineEntryCard({ entry, onEdit }: TimelineEntryCardProps) {
  // Meal Entry Card - Compact style like Dashboard
  if (entry.type === 'meal') {
    const hasAnalysis = typeof entry.ai_analysis === 'string' && entry.ai_analysis.trim().length > 0;
    const isPending = !hasAnalysis && (entry.status === 'pending' || entry.image_url);
    
    // Parse macros from ai_analysis if available
    let protein = 0, carbs = 0, fat = 0;
    if (hasAnalysis && typeof entry.ai_analysis === 'string') {
      const protMatch = entry.ai_analysis.match(/Proteínas?:?\s*(\d+)/i);
      const carbMatch = entry.ai_analysis.match(/Carboidratos?:?\s*(\d+)/i);
      const fatMatch = entry.ai_analysis.match(/Gorduras?:?\s*(\d+)/i);
      if (protMatch) protein = parseInt(protMatch[1]);
      if (carbMatch) carbs = parseInt(carbMatch[1]);
      if (fatMatch) fat = parseInt(fatMatch[1]);
    }
    
    // Get calorie percentage (mock for visual effect)
    const calorieTarget = 2000;
    const percentage = entry.calories > 0 ? Math.round((entry.calories / calorieTarget) * 100) : 0;
    
    return (
      <div className="p-3 bg-card border border-border rounded-2xl group">
        <div className="flex items-center gap-3">
          {/* Thumbnail or Icon */}
          {entry.image_url ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
              <img 
                src={entry.image_url} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
              entry.entry_method === 'ai' ? 'gradient-primary' : 'bg-muted'
            )}>
              {entry.entry_method === 'ai' ? (
                <Camera className="h-6 w-6 text-white" />
              ) : (
                <Utensils className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Top row: time + badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">{entry.time}</span>
              {isPending ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-medium">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Processando
                </span>
              ) : entry.is_emotional ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-medium">
                  <Heart className="h-2.5 w-2.5" />
                  Emocional
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#84cc16]/15 text-[#84cc16] text-[10px] font-medium">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Planejada
                </span>
              )}
            </div>
            
            {/* Food name */}
            <p className="text-sm font-medium text-foreground truncate mt-0.5">
              {isPending ? 'Aguardando análise de imagem...' : (entry.food_name || 'Refeição')}
            </p>
            
            {/* Calories */}
            <p className="text-sm text-foreground/80 tabular-nums">
              {entry.calories > 0 ? `${entry.calories}kcal` : '—'}
            </p>
          </div>
          
          {/* Right side: percentage + edit button */}
          <div className="flex flex-col items-end gap-1">
            {percentage > 0 && (
              <span className="text-xs font-medium text-[#84cc16] tabular-nums">
                {percentage}% reach
              </span>
            )}
            {!isPending && onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="h-7 w-7 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity press-effect"
                aria-label="Editar refeição"
              >
                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        {/* Macros pills */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
            Prot: {protein}g
          </span>
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
            Carb: {carbs}g
          </span>
          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
            Fat: {fat}g
          </span>
        </div>
      </div>
    );
  }

  // Mood Entry Card - Compact
  if (entry.type === 'mood') {
    const emotionData = EMOTION_TAGS.find(e => e.value === entry.emotion_tag);
    const isPositive = ['calmo', 'focado', 'feliz', 'energizado'].includes(entry.emotion_tag || '');
    
    return (
      <div className="p-3 bg-card border border-border rounded-2xl relative overflow-hidden">
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1',
          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
        )} />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/20 flex-shrink-0">
            <BrainCircuit className="h-5 w-5 text-violet-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">{entry.time}</span>
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                emotionData?.color || 'bg-muted text-muted-foreground'
              )}>
                {emotionData?.label || entry.emotion_tag}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground mt-0.5">
              Energia: {entry.mood_score}/10
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Water Entry Card - Compact
  if (entry.type === 'water') {
    return (
      <div className="px-3 py-2.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Droplet className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-sky-400/70 tabular-nums">{entry.time}</p>
            <p className="text-sm font-semibold text-sky-400 tabular-nums">+{entry.value}ml</p>
          </div>
        </div>
      </div>
    );
  }

  // Weight Entry Card - Compact
  if (entry.type === 'weight') {
    return (
      <div className="px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Scale className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-400/70 tabular-nums">{entry.time}</p>
            <p className="text-sm font-semibold text-emerald-400 tabular-nums">{entry.value}kg</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
