import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TimelineEntry } from '@/types';

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
      className="relative p-4 rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.15),0_0_0_1px_rgba(132,204,22,0.15)] dark:hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.25)] transition-shadow duration-300 overflow-hidden"
    >
      {/* Left accent border */}
      <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b from-lime-400 to-green-500" />
      
      <div className="flex gap-4 pl-2">
        {/* Image */}
        <div className="w-20 h-24 rounded-xl overflow-hidden shrink-0 shadow-md ring-2 ring-lime-500/20">
          {meal.image_url ? (
            <img 
              src={meal.image_url} 
              alt={meal.food_name} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-lime-400/30 to-green-500/30 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase text-lime-600 dark:text-lime-400">{meal.time}</p>
              <h3 className="font-bold text-foreground truncate text-base mt-0.5">
                {meal.food_name && !meal.food_name.includes('Aguardando') 
                  ? meal.food_name 
                  : (meal.description || 'Refeição')}
              </h3>
              <p className="text-sm text-muted-foreground tabular-nums mt-1">
                <span className="font-black text-lg text-foreground">{meal.calories || 0}</span>
                <span className="text-xs ml-1 font-medium">kcal</span>
              </p>
            </div>
            <div className="text-right shrink-0 bg-gradient-to-br from-lime-400/20 to-green-500/20 dark:from-lime-500/25 dark:to-green-600/25 px-3 py-1.5 rounded-xl">
              <span className="text-lg font-black text-lime-600 dark:text-lime-400">
                {reachPercentage}%
              </span>
              <p className="text-[9px] font-bold text-lime-700/70 dark:text-lime-300/70 uppercase tracking-wide">da meta</p>
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
    </motion.div>
  );
});
