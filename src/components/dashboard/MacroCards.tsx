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
    <div className="grid grid-cols-3 gap-3 px-4">
      {macros.map((macro, index) => (
        <motion.div
          key={macro.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/95 rounded-2xl p-4 text-center shadow-sm border-[3px] border-green-200/50"
        >
          <p className="text-green-800 text-sm font-medium">{macro.label}</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {macro.value}G
          </p>
          <p className="text-green-700/70 text-xs mt-1">
            {macro.percentage}%
          </p>
        </motion.div>
      ))}
    </div>
  );
}
