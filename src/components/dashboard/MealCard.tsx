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
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 dark:border-primary/10 dark:hover:border-primary/20 transition-all duration-300 overflow-hidden hover:shadow-md"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-lime-500/[0.02] dark:to-lime-500/[0.03] pointer-events-none" />
      
      <div className="relative flex gap-4">
        {/* Image with enhanced styling */}
        <div className="w-20 h-24 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border/50 dark:ring-primary/10">
          {meal.image_url ? (
            <img 
              src={meal.image_url} 
              alt={meal.food_name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
              <span className="text-2xl drop-shadow-sm">🍽️</span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground/70">{meal.time}</p>
              <h3 className="font-semibold text-foreground truncate mt-0.5">
                {meal.food_name && !meal.food_name.includes('Aguardando') 
                  ? meal.food_name 
                  : (meal.description || 'Refeição')}
              </h3>
              <p className="text-sm text-muted-foreground tabular-nums mt-0.5">
                <span className="font-semibold text-foreground">{meal.calories || 0}</span>
                <span className="text-xs ml-0.5">kcal</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-semibold text-lime-500 dark:drop-shadow-[0_0_8px_rgba(132,204,22,0.3)]">
                {reachPercentage}%
              </span>
              <p className="text-[10px] text-muted-foreground/60">da meta</p>
            </div>
          </div>
          
          {/* Macro badges with refined styling */}
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-lime-500/8 text-lime-600 dark:text-lime-400 border border-lime-500/15 dark:border-lime-500/20">
              P: {macros.protein}g
            </span>
            <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-lime-500/8 text-lime-600 dark:text-lime-400 border border-lime-500/15 dark:border-lime-500/20">
              C: {macros.carbs}g
            </span>
            <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-lime-500/8 text-lime-600 dark:text-lime-400 border border-lime-500/15 dark:border-lime-500/20">
              G: {macros.fat}g
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
