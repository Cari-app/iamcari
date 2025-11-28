import { useState, ReactNode } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

const DELETE_BUTTON_WIDTH = 76;
const SWIPE_THRESHOLD = -40;

export function SwipeableRow({ children, onDelete, className }: SwipeableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const shouldOpen = info.offset.x < SWIPE_THRESHOLD;
    setIsOpen(shouldOpen);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };

  const handleCardClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Delete button - always present but hidden behind card */}
      <div 
        className="absolute top-0 right-0 bottom-0 flex items-stretch overflow-hidden rounded-2xl"
        style={{ width: DELETE_BUTTON_WIDTH }}
      >
        <motion.button
          onClick={handleDelete}
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1',
            'bg-destructive text-white font-medium',
            'active:opacity-90'
          )}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[11px] font-semibold">Apagar</span>
        </motion.button>
      </div>

      {/* Swipeable card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -DELETE_BUTTON_WIDTH, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.3 }}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={{ 
          x: isOpen ? -DELETE_BUTTON_WIDTH : 0,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30,
        }}
        onClick={handleCardClick}
        className={cn(
          'relative z-10 touch-pan-y select-none',
          isDragging && 'cursor-grabbing'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
}
