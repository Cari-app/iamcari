import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Utensils, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoStatsProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  lastCheckIn: {
    isEmotional: boolean;
    time?: string;
  } | null;
}

export function BentoStats({ caloriesConsumed, caloriesTarget, lastCheckIn }: BentoStatsProps) {
  const caloriesProgress = Math.min((caloriesConsumed / caloriesTarget) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Nutrition Card */}
      <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-secondary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Nutrição Hoje</span>
        </div>
        
        <div className="space-y-2">
          <Progress 
            value={caloriesProgress} 
            className="h-2 bg-muted/30"
          />
          <p className="text-sm">
            <span className="font-bold text-foreground tabular-nums">
              {caloriesConsumed.toLocaleString('pt-BR')}
            </span>
            <span className="text-muted-foreground"> / {caloriesTarget.toLocaleString('pt-BR')} kcal</span>
          </p>
        </div>
      </div>

      {/* Last Check-in Card */}
      <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            lastCheckIn?.isEmotional 
              ? "bg-rose-500/20" 
              : "bg-primary/20"
          )}>
            {lastCheckIn?.isEmotional ? (
              <Heart className="h-4 w-4 text-rose-500" />
            ) : (
              <Zap className="h-4 w-4 text-primary" />
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">Último Check-in</span>
        </div>
        
        <div className="space-y-1">
          {lastCheckIn ? (
            <>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                lastCheckIn.isEmotional
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-primary/20 text-primary"
              )}>
                {lastCheckIn.isEmotional ? '❤️ Emocional' : '⚡ Fome Física'}
              </div>
              {lastCheckIn.time && (
                <p className="text-xs text-muted-foreground">{lastCheckIn.time}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem registros</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
