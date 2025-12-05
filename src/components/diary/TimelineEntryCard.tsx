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
      
      const entryMacros = entry.macros && typeof entry.macros === 'object' ? entry.macros : null;
      const analysis = entry.ai_analysis && typeof entry.ai_analysis === 'object' && !Array.isArray(entry.ai_analysis) 
        ? entry.ai_analysis as unknown as Record<string, number> 
        : null;
      
      return {
        reachPercentage: reach,
        macros: {
          protein: Number(entryMacros?.protein) || Number(analysis?.protein) || 0,
          carbs: Number(entryMacros?.carbs) || Number(analysis?.carbs) || 0,
          fat: Number(entryMacros?.fat) || Number(analysis?.fat) || 0,
        },
        isPending: entry.status === 'pending'
      };
    }, [entry.calories, entry.ai_analysis, entry.macros, dailyTarget, entry.status]);

    return (
      <div className="relative p-4 rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.15),0_0_0_1px_rgba(132,204,22,0.15)] transition-shadow duration-300 overflow-hidden group">
        {/* Left accent border */}
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-lime-400 to-green-500" />
        
        <div className="flex gap-4 pl-2">
          {/* Image */}
          <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 shadow-md ring-2 ring-lime-500/20">
            {entry.image_url ? (
              <img 
                src={entry.image_url} 
                alt={entry.food_name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-lime-400/30 to-green-500/30 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">{entry.time}</p>
                <h3 className="font-bold text-foreground truncate text-base mt-0.5">
                  {entry.food_name && !entry.food_name.includes('Aguardando') 
                    ? entry.food_name 
                    : (entry.description || 'Refeição')}
                </h3>
                <p className="text-sm text-muted-foreground tabular-nums mt-1">
                  <span className="font-black text-lg text-foreground">{entry.calories || 0}</span>
                  <span className="text-xs ml-1 font-medium">kcal</span>
                </p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="bg-gradient-to-br from-lime-400/20 to-green-500/20 dark:from-lime-500/25 dark:to-green-600/25 px-3 py-1.5 rounded-xl">
                  <span className="text-lg font-black text-lime-600 dark:text-lime-400">{reachPercentage}%</span>
                  <p className="text-[9px] font-bold text-lime-700/70 dark:text-lime-300/70 uppercase tracking-wide">reach</p>
                </div>
                {!isPending && onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="h-7 w-7 rounded-lg bg-lime-500/10 hover:bg-lime-500/20 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all press-effect"
                    aria-label="Editar refeição"
                  >
                    <Edit className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Macro badges */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25">
                P {macros.protein}g
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25">
                C {macros.carbs}g
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25">
                G {macros.fat}g
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
    
    return (
      <div className="relative p-3 bg-white dark:bg-card rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] overflow-hidden">
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-lime-400 to-green-500" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-lime-400/20 to-green-500/20 flex-shrink-0">
            <BrainCircuit className="h-5 w-5 text-lime-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">{entry.time}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-semibold text-foreground">
                Sentindo-se
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25">
                {emotionData?.label || entry.emotion_tag}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
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
      <div className="relative px-4 py-3 bg-gradient-to-r from-lime-500/10 to-green-500/10 dark:from-lime-500/15 dark:to-green-500/15 rounded-2xl shadow-[0_4px_20px_-4px_rgba(132,204,22,0.1),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-lime-400 to-green-500" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400/30 to-green-500/30 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-lime-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">{entry.time}</p>
            <p className="text-lg font-black text-lime-600 dark:text-lime-400">+{entry.value}ml</p>
          </div>
        </div>
      </div>
    );
  }

  // Weight Entry Card
  if (entry.type === 'weight') {
    return (
      <div className="relative px-4 py-3 bg-gradient-to-r from-lime-500/10 to-green-500/10 dark:from-lime-500/15 dark:to-green-500/15 rounded-2xl shadow-[0_4px_20px_-4px_rgba(132,204,22,0.1),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-lime-400 to-green-500" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400/30 to-green-500/30 flex items-center justify-center">
            <Scale className="h-5 w-5 text-lime-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">{entry.time}</p>
            <p className="text-lg font-black text-lime-600 dark:text-lime-400">{entry.value}kg</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
