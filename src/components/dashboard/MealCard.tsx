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
      className="bg-white/95 border border-green-800 rounded-2xl p-3 flex gap-4"
    >
      {/* Food Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-green-100 shrink-0">
        {meal.image_url ? (
          <img 
            src={meal.image_url} 
            alt={meal.food_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-100 flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-green-700 text-sm">{meal.time}</p>
          <h3 className="font-bold text-green-900 truncate">
            {meal.food_name || 'Refeição'}
          </h3>
          <p className="text-green-700 text-lg">
            {meal.calories || 0}kcal
          </p>
        </div>
        
        {/* Macros Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-green-800">
            <span>Prot: <span className="font-bold text-green-900">{macros.protein}g</span></span>
            <span>Carb: <span className="font-bold text-green-900">{macros.carbs}g</span></span>
            <span>Fat: <span className="font-bold text-green-900">{macros.fat}g</span></span>
          </div>
          <span className="text-green-700 text-sm font-medium">{reachPercentage}% reach</span>
        </div>
      </div>
    </motion.div>
  );
}
