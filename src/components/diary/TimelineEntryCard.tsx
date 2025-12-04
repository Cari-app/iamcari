import { memo, useMemo } from 'react';
import { Droplet, Scale, BrainCircuit, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEntry, EMOTION_TAGS } from '@/types';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  onEdit?: () => void;
  dailyTarget?: number;
}

export const TimelineEntryCard = memo(function TimelineEntryCard({ entry, onEdit, dailyTarget = 2000 }: TimelineEntryCardProps) {
  // Meal Entry Card - Same style as MealCard from Dashboard
  if (entry.type === 'meal') {
    const { reachPercentage, macros, isPending } = useMemo(() => {
      const reach = dailyTarget > 0 
        ? Math.round((entry.calories || 0) / dailyTarget * 100) 
        : 0;
      
      const analysis = typeof entry.ai_analysis === 'object' ? entry.ai_analysis : null;
      
      return {
        reachPercentage: reach,
        macros: {
          protein: analysis?.protein || 0,
          carbs: analysis?.carbs || 0,
          fat: analysis?.fat || 0,
        },
        isPending: entry.status === 'pending'
      };
    }, [entry.calories, entry.ai_analysis, dailyTarget, entry.status]);

    return (
      <div className="p-4 rounded-2xl bg-card border border-border group">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
            {entry.image_url ? (
              <img 
                src={entry.image_url} 
                alt={entry.food_name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#84cc16]/20 to-[#84cc16]/5 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{entry.time}</p>
                <h3 className="font-semibold text-foreground truncate">
                  {isPending ? 'Aguardando análise de imagem...' : (entry.food_name || 'Refeição')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {entry.calories || 0}kcal
                </p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <span className="text-sm font-medium text-[#84cc16]">{reachPercentage}% reach</span>
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
            
            {/* Macro badges */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20">
                Prot: {macros.protein}g
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20">
                Carb: {macros.carbs}g
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20">
                Fat: {macros.fat}g
              </span>
            </div>
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
            <p className="text-xs text-muted-foreground">{entry.time}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Sentindo-se
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                emotionData?.color || 'bg-muted text-muted-foreground'
              )}>
                {emotionData?.label || entry.emotion_tag}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Energia: {entry.mood_score}/10
            </p>
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
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-sky-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-sky-400/70">{entry.time}</p>
            <p className="text-lg font-semibold text-sky-400">+{entry.value}ml</p>
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Scale className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-400/70">{entry.time}</p>
            <p className="text-lg font-semibold text-emerald-400">{entry.value}kg</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
