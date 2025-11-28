import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CircularProgress } from '@/components/CircularProgress';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { MealLogModal } from '@/components/MealLogModal';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { BentoStats } from '@/components/dashboard/BentoStats';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Flame, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  
  const {
    elapsedSeconds,
    progress,
    isActive,
    currentPhase,
    phaseInfo,
    startFasting,
    stopFasting,
    formatTime,
    targetHours,
  } = useFastingTimer();

  // Mock data for nutrition and check-in (replace with real data later)
  const mockNutrition = { consumed: 850, target: 1800 };
  const mockLastCheckIn = { isEmotional: false, time: 'Há 2 horas' };

  const time = formatTime(elapsedSeconds);

  const phaseIcons = {
    'fed': Flame,
    'fasting': Zap,
    'ketosis': Flame,
    'autophagy': Sparkles,
    'deep-autophagy': Sparkles,
  };

  const PhaseIcon = phaseIcons[currentPhase];

  return (
    <div className="min-h-[100dvh] bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-foreground">
              {isActive ? 'Jejum em andamento' : 'Pronto para começar?'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex justify-center py-2"
          >
            <CircularProgress progress={isActive ? progress : 0} size={220} strokeWidth={16}>
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tabular-nums text-foreground dark:text-slate-50">
                    {time.hours}
                  </span>
                  <span className="text-2xl font-bold text-foreground/60 dark:text-slate-400">:</span>
                  <span className="text-5xl font-extrabold tabular-nums text-foreground dark:text-slate-50">
                    {time.minutes}
                  </span>
                  <span className="text-2xl font-bold text-foreground/60 dark:text-slate-400">:</span>
                  <span className="text-3xl font-bold tabular-nums text-foreground/70 dark:text-slate-300">
                    {time.seconds}
                  </span>
                </div>
                
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                      "bg-card border border-border"
                    )}>
                      <PhaseIcon className={cn("h-4 w-4", phaseInfo.color)} />
                      <span className={cn("text-sm font-medium", phaseInfo.color)}>
                        {phaseInfo.label}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3"
                  >
                    <ProtocolSelector
                      selectedHours={selectedProtocol}
                      onSelect={setSelectedProtocol}
                      isOpen={isProtocolOpen}
                      onOpenChange={setIsProtocolOpen}
                    />
                  </motion.div>
                )}
              </div>
            </CircularProgress>
          </motion.div>

          {/* Bento Stats Grid */}
          <BentoStats
            caloriesConsumed={mockNutrition.consumed}
            caloriesTarget={mockNutrition.target}
            lastCheckIn={mockLastCheckIn}
          />

          {/* Phase Info Card */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <p className="text-center text-muted-foreground">
                {phaseInfo.description}
              </p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary tabular-nums">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progresso</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary tabular-nums">
                    {targetHours}h
                  </p>
                  <p className="text-xs text-muted-foreground">Meta</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            {!isActive ? (
              <Button
                onClick={() => startFasting(selectedProtocol)}
                className="flex-1 h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-violet"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopFasting}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-semibold text-base press-effect border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Encerrar
                </Button>
                <Button
                  onClick={() => {
                    stopFasting();
                    setTimeout(() => startFasting(selectedProtocol), 100);
                  }}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl press-effect"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: 'Esta semana', value: '5', unit: 'jejuns' },
              { label: 'Sequência', value: '12', unit: 'dias' },
              { label: 'Tokens', value: '8', unit: '💎' },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-card border border-border text-center"
              >
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      <BottomNav />
      <MealLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
