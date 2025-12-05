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
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-2xl bg-card border border-border dark:border-primary/10 text-center shadow-sm dark:hover:border-primary/20 transition-colors"
        >
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {macros[key].value}g
          </p>
          <Icon className="h-5 w-5 mx-auto mt-2 text-lime-500" />
        </motion.div>
      ))}
    </div>
  );
});
