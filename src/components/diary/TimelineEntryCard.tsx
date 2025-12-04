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
      <div className="p-4 rounded-2xl bg-card border border-border group">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
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
                  {entry.food_name && !entry.food_name.includes('Aguardando') 
                    ? entry.food_name 
                    : (entry.description || 'Refeição')}
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
    
    return (
      <div className="p-3 bg-card border border-border rounded-2xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#84cc16]" />
        
        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#84cc16]/20 flex-shrink-0">
            <BrainCircuit className="h-5 w-5 text-[#84cc16]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{entry.time}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Sentindo-se
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#84cc16]/20 text-[#84cc16]">
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
      <div className="px-4 py-3 bg-[#84cc16]/10 border border-[#84cc16]/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-[#84cc16]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#84cc16]/70">{entry.time}</p>
            <p className="text-lg font-semibold text-[#84cc16]">+{entry.value}ml</p>
          </div>
        </div>
      </div>
    );
  }

  // Weight Entry Card
  if (entry.type === 'weight') {
    return (
      <div className="px-4 py-3 bg-[#84cc16]/10 border border-[#84cc16]/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
            <Scale className="h-5 w-5 text-[#84cc16]" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[#84cc16]/70">{entry.time}</p>
            <p className="text-lg font-semibold text-[#84cc16]">{entry.value}kg</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
