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
  }} className="text-center px-4 pb-6">
      <div className="mb-2">
        <span className="text-6xl font-extrabold text-white tabular-nums">
          {formattedConsumed}
        </span>
        <p className="text-white/70 text-lg mt-1">kcal</p>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-[#ecfccb] rounded-full overflow-hidden">
          <motion.div initial={{
          width: 0
        }} animate={{
          width: `${percentage}%`
        }} transition={{
          duration: 0.8,
          ease: 'easeOut'
        }} className="h-full bg-[#84cc16] rounded-full" />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-green-50">0 kcal</span>
          <span className="font-bold text-green-50">{formattedTarget}kcal</span>
        </div>
      </div>
    </motion.div>;
}