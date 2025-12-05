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
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="text-center px-4 pt-6 pb-8">
      {/* Big calorie display */}
      <div className="relative inline-block">
        <span className="text-7xl font-black text-white tabular-nums tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          {formattedConsumed}
        </span>
        <span className="absolute -right-12 top-2 text-lg font-bold text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]">kcal</span>
      </div>
      <p className="text-sm font-medium mt-2 tracking-widest uppercase text-lime-800 dark:text-lime-500">consumidas hoje</p>
      
      {/* Progress section */}
      <div className="mt-6 mx-auto max-w-xs">
        {/* Progress bar with glow */}
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
          <motion.div initial={{
          width: 0
        }} animate={{
          width: `${percentage}%`
        }} transition={{
          duration: 0.8,
          ease: 'easeOut'
        }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-lime-400 via-lime-300 to-green-400 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.6)]" />
        </div>
        
        {/* Labels */}
        <div className="flex justify-between mt-2">
          <span className="text-xs font-bold text-green-700">0</span>
          <span className="text-sm font-bold text-lime-700">{Math.round(percentage)}%</span>
          <span className="text-xs font-bold text-green-700">{formattedTarget}</span>
        </div>
      </div>
    </motion.div>;
}