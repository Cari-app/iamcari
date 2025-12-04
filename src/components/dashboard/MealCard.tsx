import { motion } from 'framer-motion';
import { TimelineEntry } from '@/types';

interface MealCardProps {
  meal: TimelineEntry;
  dailyTarget: number;
}

export function MealCard({ meal, dailyTarget }: MealCardProps) {
  if (meal.type !== 'meal') return null;
  
  const reachPercentage = dailyTarget > 0 
    ? Math.round((meal.calories || 0) / dailyTarget * 100) 
    : 0;

  // Parse AI analysis macros if available
  const analysis = typeof meal.ai_analysis === 'object' ? meal.ai_analysis : null;
  const macros = {
    protein: analysis?.protein || 0,
    carbs: analysis?.carbs || 0,
    fat: analysis?.fat || 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 flex gap-4"
    >
      {/* Food Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
        {meal.image_url ? (
          <img 
            src={meal.image_url} 
            alt={meal.food_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-sm">{meal.time}</p>
        <h3 className="font-semibold text-foreground truncate mt-0.5">
          {meal.food_name || 'Refeição'}
        </h3>
        <p className="text-primary font-medium">
          {meal.calories || 0}kcal
        </p>
        
        {/* Macros */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Prot: <span className="text-primary font-medium">{macros.protein}g</span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Carb: <span className="text-primary font-medium">{macros.carbs}g</span>
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Fat: <span className="text-primary font-medium">{macros.fat}g</span>
          </span>
        </div>
      </div>
      
      {/* Reach Percentage */}
      <div className="text-right shrink-0">
        <p className="text-muted-foreground text-sm">{reachPercentage}% reach</p>
      </div>
    </motion.div>
  );
}
