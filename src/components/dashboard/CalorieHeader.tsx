import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface CalorieHeaderProps {
  consumed: number;
  target: number;
}

export function CalorieHeader({
  consumed,
  target
}: CalorieHeaderProps) {
  const percentage = useMemo(() => target > 0 ? Math.min(consumed / target * 100, 100) : 0, [consumed, target]);
  const formattedConsumed = useMemo(() => consumed.toLocaleString('pt-BR'), [consumed]);
  const formattedTarget = useMemo(() => target.toLocaleString('pt-BR'), [target]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center px-4 pt-4 pb-6"
    >
      <div className="mb-2">
        <span className="text-6xl font-extrabold text-white tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
          {formattedConsumed}
        </span>
        <p className="text-white/60 text-base font-medium mt-1 mb-4 tracking-wide">calorias consumidas</p>
      </div>
      
      <div className="mt-4 space-y-2.5">
        {/* Enhanced progress bar with glow effect */}
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percentage}%` }} 
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }} 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.4)]" 
          />
          {/* Shimmer effect */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-white/70">0</span>
          <span className="font-semibold text-white/90">{formattedTarget} kcal</span>
        </div>
      </div>
    </motion.div>
  );
}
