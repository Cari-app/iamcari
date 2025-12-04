import { motion } from 'framer-motion';

interface MacroCardsProps {
  protein: { value: number; percentage: number };
  carbs: { value: number; percentage: number };
  fat: { value: number; percentage: number };
}

export function MacroCards({ protein, carbs, fat }: MacroCardsProps) {
  const macros = [
    { label: 'Protein', value: protein.value, percentage: protein.percentage },
    { label: 'Carb', value: carbs.value, percentage: carbs.percentage },
    { label: 'Fat', value: fat.value, percentage: fat.percentage },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 px-4 -mt-4">
      {macros.map((macro, index) => (
        <motion.div
          key={macro.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-2xl p-4 text-center"
        >
          <p className="text-muted-foreground text-sm">{macro.label}</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {macro.value}G
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {macro.percentage}%
          </p>
        </motion.div>
      ))}
    </div>
  );
}
