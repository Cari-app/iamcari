import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-24 right-6 z-40 flex items-center justify-center',
        'w-14 h-14 rounded-full gradient-primary shadow-violet',
        'press-effect hover:shadow-glow transition-shadow duration-300',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
    </motion.button>
  );
}
