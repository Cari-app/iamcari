import { useMemo } from 'react';

interface CalorieHeaderProps {
  consumed: number;
  target: number;
}

export function CalorieHeader({
  consumed,
  target
}: CalorieHeaderProps) {
  const percentage = useMemo(() => target > 0 ? Math.min(consumed / target * 100, 100) : 0, [consumed, target]);
  const formattedConsumed = useMemo(() => consumed.toLocaleString('pt-BR'), [consumed]);
  const formattedTarget = useMemo(() => target.toLocaleString('pt-BR'), [target]);

  return (
    <div className="text-center px-4 pt-4 pb-6">
      <div className="mb-2">
        <span className="text-6xl font-extrabold text-white tabular-nums">
          {formattedConsumed}
        </span>
        <p className="text-white/70 text-lg mt-1 mb-4">kcal</p>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-lime-500/20 rounded-full overflow-hidden">
          <div 
            style={{ width: `${percentage}%` }} 
            className="h-full bg-lime-500 rounded-full transition-all duration-500" 
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-white">0 kcal</span>
          <span className="font-bold text-white">{formattedTarget} kcal</span>
        </div>
      </div>
    </div>
  );
}
