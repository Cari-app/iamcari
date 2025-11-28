import { useState, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableRowProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

export function SwipeableRow({ children, onDelete, className }: SwipeableRowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.8, 0]);
  
  const DELETE_THRESHOLD = -60;
  const DELETE_BUTTON_WIDTH = 72;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < DELETE_THRESHOLD) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleDelete = () => {
    onDelete();
    setIsOpen(false);
  };

  const closeSwipe = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Delete Button Background */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ 
          width: DELETE_BUTTON_WIDTH + 8,
          opacity: deleteOpacity,
        }}
      >
        <button
          onClick={handleDelete}
          className="flex flex-col items-center justify-center gap-1 h-full w-full bg-destructive text-white rounded-2xl"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-medium">Apagar</span>
        </button>
      </motion.div>

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -DELETE_BUTTON_WIDTH, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x: isOpen ? -DELETE_BUTTON_WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={isOpen ? closeSwipe : undefined}
        className={cn(
          'relative rounded-2xl',
          isDragging && 'cursor-grabbing'
        )}
        style={{ x }}
      >
        {children}
      </motion.div>
    </div>
  );
}
