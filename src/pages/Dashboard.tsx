import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, RotateCcw, Flame, Zap, Sparkles, Target, MapPin, UtensilsCrossed, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { useUserRole } from '@/hooks/useUserRole';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';
import { FitCoinIcon } from '@/components/FitCoinIcon';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  useAchievementNotifications(); // Enable achievement notifications
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  
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
  const [gameCoins, setGameCoins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        // Fetch today's meals
        const { data: mealsData, error: mealsError } = await supabase
        .from('meal_logs')
        .select('calories, is_emotional, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false });
      
      if (mealsError) {
        console.error('Error fetching meals:', mealsError);
        toast({
          title: '❌ Erro ao carregar dados',
          description: 'Não foi possível carregar as refeições. Tente novamente.',
          variant: 'destructive',
        });
      }
      
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
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('fasting_sessions')
        .select('id')
        .eq('user_id', user.id)
        .not('end_time', 'is', null)
        .gte('start_time', sevenDaysAgo);
      
      if (weeklyError) {
        console.error('Error fetching weekly data:', weeklyError);
      }
      
      setWeeklyFasts(weeklyData?.length || 0);
      
      // Fetch user stats (streak and coins from database)
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('current_streak, game_coins')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (statsError) {
        console.error('Error fetching user stats:', statsError);
      }
      
      if (statsData) {
        setCurrentStreak(statsData.current_streak || 0);
        setGameCoins(statsData.game_coins || 0);
      }
      } catch (error) {
        console.error('Unexpected error fetching dashboard data:', error);
        toast({
          title: '❌ Erro inesperado',
          description: 'Ocorreu um erro ao carregar os dados. Tente recarregar a página.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Realtime subscriptions for stats updates
    const statsChannel = supabase
      .channel('dashboard-stats-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('User stats updated:', payload);
          if (payload.new) {
            setCurrentStreak(payload.new.current_streak || 0);
            setGameCoins(payload.new.game_coins || 0);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated (FitCoins may have changed):', payload);
          // Profile update will trigger AuthContext refresh automatically
          refreshProfile();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(statsChannel);
    };
  }, [user, refreshProfile]);

  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    
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
    <div className="min-h-[100dvh] bg-background pb-24 pt-[130px] overflow-x-clip overflow-y-visible relative">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
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
                onClick={() => startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard')}
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
                    setTimeout(() => startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard'), 100);
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
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {loading ? (
              <>
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </>
            ) : (
              <>
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
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <FitCoinIcon size={20} />
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {profile?.token_balance || 0}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    FitCoins
                  </p>
                </div>
                
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <p className="text-2xl font-bold text-foreground tabular-nums">
                      {gameCoins}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Game Coins
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Feature Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            <button
              onClick={() => navigate('/nutrition-quiz')}
              className="p-4 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-colors press-effect text-center"
            >
              <div className="flex justify-center mb-2">
                <MapPin className="h-6 w-6 text-violet-500" />
              </div>
              <p className="text-xs text-foreground font-medium leading-tight">
                Mapeamento<br/>Alimentar
              </p>
            </button>

            <button
              onClick={() => navigate('/diets')}
              className="p-4 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-colors press-effect text-center"
            >
              <div className="flex justify-center mb-2">
                <UtensilsCrossed className="h-6 w-6 text-teal-500" />
              </div>
              <p className="text-xs text-foreground font-medium leading-tight">
                Explorar<br/>Dietas
              </p>
            </button>

            <button
              onClick={() => navigate('/fasting-quiz')}
              className="p-4 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-colors press-effect text-center"
            >
              <div className="flex justify-center mb-2">
                <Clock className="h-6 w-6 text-violet-500" />
              </div>
              <p className="text-xs text-foreground font-medium leading-tight">
                Jejum<br/>Prime
              </p>
            </button>
          </motion.div>
        </div>
      </main>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      <BottomNav />
      
      <MealLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPhotoSubmitted={handlePhotoSubmitted}
      />
    </div>
  );
}
