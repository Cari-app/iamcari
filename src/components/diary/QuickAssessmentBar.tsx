import { motion } from 'framer-motion';
import { BrainCircuit, Droplet, Scale, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAssessmentBarProps {
  onMoodClick: () => void;
  onWaterClick: () => void;
  onWeightClick: () => void;
  onMealClick: () => void;
}

const actions = [
  {
    id: 'mood',
    label: 'Check-in',
    icon: BrainCircuit,
    color: 'text-violet-400',
    hoverBg: 'hover:bg-violet-500/10',
    activeBg: 'active:bg-violet-500/20',
  },
  {
    id: 'water',
    label: 'Hidratação',
    icon: Droplet,
    color: 'text-sky-400',
    hoverBg: 'hover:bg-sky-500/10',
    activeBg: 'active:bg-sky-500/20',
  },
  {
    id: 'weight',
    label: 'Peso',
    icon: Scale,
    color: 'text-emerald-400',
    hoverBg: 'hover:bg-emerald-500/10',
    activeBg: 'active:bg-emerald-500/20',
  },
  {
    id: 'meal',
    label: 'Refeição',
    icon: Utensils,
    color: 'text-rose-400',
    hoverBg: 'hover:bg-rose-500/10',
    activeBg: 'active:bg-rose-500/20',
  },
];

export function QuickAssessmentBar({
  onMoodClick,
  onWaterClick,
  onWeightClick,
  onMealClick,
}: QuickAssessmentBarProps) {
  const handlers: Record<string, () => void> = {
    mood: onMoodClick,
    water: onWaterClick,
    weight: onWeightClick,
    meal: onMealClick,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-4 gap-2"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          onClick={handlers[action.id]}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl',
            'bg-white/5 dark:bg-white/5 border border-white/10',
            'transition-all duration-200',
            action.hoverBg,
            action.activeBg,
            'active:scale-95'
          )}
        >
          <action.icon className={cn('h-5 w-5', action.color)} />
          <span className="text-xs font-medium text-muted-foreground">
            {action.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}
