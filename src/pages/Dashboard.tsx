import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { CircularProgress } from '@/components/CircularProgress';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { BentoStats } from '@/components/dashboard/BentoStats';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Flame, Zap, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  
  // Sync selected protocol with profile on mount
  useEffect(() => {
    if (profile?.fasting_protocol) {
      const hours = parseInt(profile.fasting_protocol.replace('h', ''));
      setSelectedProtocol(hours);
    }
  }, [profile]);
  
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

  // Fetch real data from Supabase
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<{ isEmotional: boolean; time: string } | null>(null);
  const [weeklyFasts, setWeeklyFasts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Fetch today's meals
      const { data: mealsData } = await supabase
        .from('meal_logs')
        .select('calories, is_emotional, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false });
      
      if (mealsData) {
        const totalCalories = mealsData.reduce((sum, log) => sum + (log.calories || 0), 0);
        setCaloriesConsumed(totalCalories);
        
        if (mealsData.length > 0) {
          const lastLog = mealsData[0];
          const logTime = new Date(lastLog.created_at);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - logTime.getTime()) / 60000);
          
          let timeText = '';
          if (diffMinutes < 60) {
            timeText = `Há ${diffMinutes} minutos`;
          } else {
            const hours = Math.floor(diffMinutes / 60);
            timeText = `Há ${hours} hora${hours > 1 ? 's' : ''}`;
          }
          
          setLastCheckIn({
            isEmotional: lastLog.is_emotional || false,
            time: timeText,
          });
        }
      }
      
      // Fetch weekly fasting sessions (last 7 days, completed only)
      const { data: weeklyData } = await supabase
        .from('fasting_sessions')
        .select('id')
        .eq('user_id', user.id)
        .not('end_time', 'is', null)
        .gte('start_time', sevenDaysAgo);
      
      setWeeklyFasts(weeklyData?.length || 0);
      
      // Calculate streak (consecutive days with at least one completed fast)
      const { data: allSessions } = await supabase
        .from('fasting_sessions')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false });
      
      if (allSessions && allSessions.length > 0) {
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        const sessionsByDay = new Map<string, boolean>();
        allSessions.forEach(session => {
          const dayKey = new Date(session.start_time).toISOString().split('T')[0];
          sessionsByDay.set(dayKey, true);
        });
        
        while (true) {
          const dayKey = currentDate.toISOString().split('T')[0];
          if (sessionsByDay.has(dayKey)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (streak > 0) {
            break;
          } else {
            currentDate.setDate(currentDate.getDate() - 1);
            if (currentDate < new Date(allSessions[allSessions.length - 1].start_time)) {
              break;
            }
          }
        }
        
        setCurrentStreak(streak);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleProtocolSelect = async (hours: number) => {
    setSelectedProtocol(hours);
    
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ fasting_protocol: `${hours}h` })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating fasting protocol:', error);
    } else {
      // Refresh profile context
      refreshProfile?.();
    }
  };

  const handleMealSubmit = async (data: { 
    method: 'ai' | 'manual';
    description: string;
    calories?: number;
    imageUrl?: string;
    isEmotional?: boolean;
  }) => {
    // Não fazemos nada aqui, apenas para entrada manual
    // A captura de foto já insere diretamente no banco
  };

  const handlePhotoSubmitted = () => {
    // Após foto ser enviada, redireciona para /diary
    setIsModalOpen(false);
    navigate('/diary');
  };

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
    <div className="min-h-[100dvh] bg-background pb-24 pt-20 overflow-x-clip overflow-y-visible">
      <Navbar />
      
      <main className="px-4 py-6 overflow-visible">
        <div className="mx-auto max-w-lg space-y-6 overflow-visible">
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
            className="flex justify-center py-4 overflow-visible"
          >
            <CircularProgress progress={isActive ? progress : 0} size={260} strokeWidth={20}>
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
                      onSelect={handleProtocolSelect}
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
            caloriesConsumed={caloriesConsumed}
            caloriesTarget={profile?.daily_calories_target || 1800}
            lastCheckIn={lastCheckIn}
          />

          {/* Warning: No Metabolic Assessment */}
          {(!profile?.daily_calories_target || profile.daily_calories_target === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-400 mb-1">
                    Avaliação Metabólica Necessária
                  </p>
                  <p className="text-sm text-amber-300/80 mb-3">
                    Complete sua avaliação para calcular suas metas calóricas personalizadas
                  </p>
                  <Button
                    onClick={() => navigate('/assessment')}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Fazer Avaliação Agora
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

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
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {weeklyFasts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Esta semana
              </p>
            </div>
            
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sequência
              </p>
            </div>
            
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {profile?.token_balance || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tokens 💎
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      <BottomNav />
      
      <MealInputDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleMealSubmit}
        onPhotoSubmitted={handlePhotoSubmitted}
      />
    </div>
  );
}
