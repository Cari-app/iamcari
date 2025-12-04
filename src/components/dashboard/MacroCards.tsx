import { memo } from 'react';
import { motion } from 'framer-motion';
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
}
const MACROS_CONFIG = [{
  key: 'protein',
  label: 'Protein'
}, {
  key: 'carbs',
  label: 'Carb'
}, {
  key: 'fat',
  label: 'Fat'
}] as const;
export const MacroCards = memo(function MacroCards({
  protein,
  carbs,
  fat
}: MacroCardsProps) {
  const macros = {
    protein,
    carbs,
    fat
  };
  return <div className="grid grid-cols-3 gap-3 px-4">
      {MACROS_CONFIG.map(({
      key,
      label
    }, index) => <motion.div key={key} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: index * 0.1
    }} className="bg-white/95 rounded-2xl p-4 text-center border-green-800 border-0 shadow-md">
          <p className="text-green-800 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {macros[key].value}G
          </p>
          <p className="text-green-700/70 text-xs mt-1">
            {macros[key].percentage}%
          </p>
        </motion.div>)}
    </div>;
});