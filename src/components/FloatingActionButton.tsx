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
        'fixed bottom-28 right-6 z-40 flex items-center justify-center',
        'w-12 h-12 rounded-full gradient-primary',
        'shadow-lg shadow-violet/30',
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
          '0 10px 25px -5px hsl(263 70% 58% / 0.3)',
          '0 10px 35px -5px hsl(263 70% 58% / 0.5)',
          '0 10px 25px -5px hsl(263 70% 58% / 0.3)',
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
      <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
    </motion.button>
  );
}
