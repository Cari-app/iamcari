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
        'fixed bottom-28 right-6 z-[60] flex items-center justify-center',
        'w-14 h-14 rounded-full bg-green-900',
        'shadow-xl shadow-green-950/50',
        'press-effect transition-shadow duration-300',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: [
          '0 10px 25px -5px rgba(5, 46, 22, 0.5)',
          '0 10px 35px -5px rgba(5, 46, 22, 0.7)',
          '0 10px 25px -5px rgba(5, 46, 22, 0.5)',
        ]
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 20,
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
    >
      <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
    </motion.button>
  );
}
