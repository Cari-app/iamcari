import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface CalorieHeaderProps {
  consumed: number;
  target: number;
}

export function CalorieHeader({ consumed, target }: CalorieHeaderProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center px-4 pb-6"
    >
      {/* Large Calorie Display */}
      <div className="mb-2">
        <span className="text-6xl font-extrabold text-white tabular-nums">
          {consumed.toLocaleString('pt-BR')}
        </span>
        <p className="text-white/70 text-lg mt-1">kcal</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-green-100/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-400 to-green-300 rounded-full"
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white font-medium">0 kcal</span>
          <span className="text-white/80">{target.toLocaleString('pt-BR')}kcal</span>
        </div>
      </div>
    </motion.div>
  );
}
