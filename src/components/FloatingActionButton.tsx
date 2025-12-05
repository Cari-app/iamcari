import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-28 right-6 z-[100] flex items-center justify-center',
        'w-14 h-14 rounded-full bg-green-900',
        'shadow-xl shadow-green-950/50',
        'press-effect transition-all duration-300 hover:scale-105 active:scale-95',
        className
      )}
    >
      <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
    </button>
  );
}
