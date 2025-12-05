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
          transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="group relative p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 dark:border-primary/10 text-center shadow-sm hover:shadow-md dark:hover:border-primary/25 transition-all duration-300 overflow-hidden"
        >
          {/* Subtle shimmer on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <p className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/80 mb-1.5">{label}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {macros[key].value}<span className="text-lg font-semibold text-muted-foreground">g</span>
          </p>
          <div className="mt-2.5 flex justify-center">
            <div className="p-1.5 rounded-full bg-lime-500/10 dark:bg-lime-500/15">
              <Icon className="h-4 w-4 text-lime-500 dark:drop-shadow-[0_0_6px_rgba(132,204,22,0.4)]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});
