import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TimelineEntry } from '@/types';
import { Loader2 } from 'lucide-react';

interface MealCardProps {
  meal: TimelineEntry;
  dailyTarget: number;
}

export const MealCard = memo(function MealCard({ meal, dailyTarget }: MealCardProps) {
  if (meal.type !== 'meal') return null;

  const { reachPercentage, macros, isPending } = useMemo(() => {
    const reach = dailyTarget > 0 
      ? Math.round((meal.calories || 0) / dailyTarget * 100) 
      : 0;
    
    const mealMacros = meal.macros && typeof meal.macros === 'object' ? meal.macros : null;
    const analysis = meal.ai_analysis && typeof meal.ai_analysis === 'object' && !Array.isArray(meal.ai_analysis) 
      ? meal.ai_analysis as unknown as Record<string, number> 
      : null;
    
    return {
      reachPercentage: reach,
      macros: {
        protein: Number(mealMacros?.protein) || Number(analysis?.protein) || 0,
        carbs: Number(mealMacros?.carbs) || Number(analysis?.carbs) || 0,
        fat: Number(mealMacros?.fat) || Number(analysis?.fat) || 0,
      },
      isPending: meal.status === 'pending'
    };
  }, [meal.calories, meal.ai_analysis, meal.macros, dailyTarget, meal.status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-card border border-border"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
          {meal.image_url ? (
            <img 
              src={meal.image_url} 
              alt={meal.food_name} 
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
              <p className="text-xs text-muted-foreground">{meal.time}</p>
              <h3 className="font-semibold text-foreground truncate">
                {isPending ? 'Aguardando análise de imagem...' : (meal.food_name || 'Refeição')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {meal.calories || 0}kcal
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-medium text-[#84cc16]">{reachPercentage}% reach</span>
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
    </motion.div>
  );
});
