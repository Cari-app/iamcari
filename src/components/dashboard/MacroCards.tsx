import { memo } from 'react';
import { motion } from 'framer-motion';
import { Beef, Wheat, Droplets } from 'lucide-react';

interface MacroCardsProps {
  protein: {
    value: number;
    percentage: number;
  };
  carbs: {
    value: number;
    percentage: number;
  };
  fat: {
    value: number;
    percentage: number;
  };
  className?: string;
}

const MACROS_CONFIG = [
  { key: 'protein', label: 'Proteína', icon: Beef },
  { key: 'carbs', label: 'Carboidrato', icon: Wheat },
  { key: 'fat', label: 'Gordura', icon: Droplets },
] as const;

export const MacroCards = memo(function MacroCards({
  protein,
  carbs,
  fat,
  className
}: MacroCardsProps) {
  const macros = { protein, carbs, fat };

  return (
    <div className={`grid grid-cols-3 gap-3 px-4 ${className || ''}`}>
      {MACROS_CONFIG.map(({ key, label, icon: Icon }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative p-4 rounded-2xl bg-white dark:bg-card text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.2),0_0_0_1px_rgba(132,204,22,0.2)] dark:hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.3),0_0_0_1px_rgba(132,204,22,0.25)] transition-shadow duration-300"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r from-green-500 via-lime-400 to-green-500" />
          
          <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mt-2 mb-2">{label}</p>
          <p className="text-3xl font-black text-foreground tabular-nums">
            {macros[key].value}<span className="text-base font-bold text-lime-500 ml-0.5">g</span>
          </p>
          <div className="mt-3 flex justify-center">
            <div className="p-2 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 dark:from-lime-500/20 dark:to-green-500/30">
              <Icon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
