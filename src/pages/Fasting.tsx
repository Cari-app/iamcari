import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { CircularProgress } from '@/components/CircularProgress';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Clock, Flame, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoImage from '@/assets/logo-cari.png';
import { toast } from '@/hooks/use-toast';

interface HistorySession {
  id: string;
  start_time: string;
  end_time: string;
  target_hours: number;
  elapsed_minutes: number;
  progress: number;
  status: 'completed' | 'paused';
}

interface FastingSession {
  id: string;
  start_time: string;
  end_time: string | null;
  target_hours: number | null;
  status: string | null;
}

export default function Fasting() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 7 });
  const [historyList, setHistoryList] = useState<HistorySession[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load protocol from profile
  useEffect(() => {
    if (profile?.fasting_protocol) {
      const protocolStr = profile.fasting_protocol.replace('h', '').replace(':', '');
      const hours = parseInt(protocolStr.split('_')[0] || protocolStr);
      if (!isNaN(hours) && hours > 0) {
        setSelectedProtocol(hours);
      }
    }
  }, [profile]);
  
  const {
    elapsedSeconds,
    progress,
    isActive,
    startFasting,
    stopFasting,
    formatTime,
    targetHours,
    loading: timerLoading,
  } = useFastingTimer();

  // Calculate streaks from sessions
  const calculateStreaks = useCallback((sessions: FastingSession[]) => {
    if (!sessions || sessions.length === 0) {
      setBestStreak(0);
      setCurrentStreak(0);
      return;
    }

    // Filter completed sessions and sort by date
    const completedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    if (completedSessions.length === 0) {
      setBestStreak(0);
      setCurrentStreak(0);
      return;
    }

    // Get unique days with completed fasts
    const uniqueDays = new Set<string>();
    completedSessions.forEach(session => {
      const date = new Date(session.start_time);
      uniqueDays.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
    });

    const sortedDays = Array.from(uniqueDays)
      .map(d => {
        const [y, m, day] = d.split('-').map(Number);
        return new Date(y, m, day);
      })
      .sort((a, b) => b.getTime() - a.getTime());

    // Calculate current streak
    let currentStreakCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      const sessionDate = new Date(sortedDays[i]);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === expectedDate.getTime()) {
        currentStreakCount++;
      } else if (i === 0 && sessionDate.getTime() === expectedDate.getTime() - 86400000) {
        // Allow for yesterday if no fast today
        const yesterdayExpected = new Date(expectedDate);
        yesterdayExpected.setDate(yesterdayExpected.getDate() - 1);
        if (sessionDate.getTime() === yesterdayExpected.getTime()) {
          currentStreakCount++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    setCurrentStreak(currentStreakCount);

    // Calculate best streak (historical)
    let maxStreak = currentStreakCount;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = sortedDays[i - 1];
      const currDate = sortedDays[i];
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
      
      if (diffDays === 1) {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    
    setBestStreak(Math.max(maxStreak, currentStreakCount));
  }, []);

  // Fetch all fasting data
  const fetchFastingData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch all sessions for this user
      const { data: sessions, error: sessionsError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seu histórico de jejum.',
          variant: 'destructive',
        });
        return;
      }

      if (sessions) {
        // Calculate streaks
        calculateStreaks(sessions as FastingSession[]);
        
        // Weekly goal - completed sessions in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        
        const weeklyCompleted = sessions.filter(s => 
          s.status === 'completed' && 
          new Date(s.start_time) >= sevenDaysAgo
        ).length;
        
        setWeeklyGoal({ completed: weeklyCompleted, target: 7 });
        
        // Build history list from completed and paused sessions
        const historyData = sessions
          .filter(s => s.status === 'completed' || s.status === 'paused')
          .filter(s => s.end_time) // Only sessions with end time
          .slice(0, 10) // Limit to last 10
          .map(session => {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time!);
            const elapsedMs = end.getTime() - start.getTime();
            const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
            const targetMins = (session.target_hours || 16) * 60;
            
            return {
              id: session.id,
              start_time: session.start_time,
              end_time: session.end_time!,
              target_hours: session.target_hours || 16,
              elapsed_minutes: elapsedMins,
              progress: Math.round((elapsedMins / targetMins) * 100),
              status: session.status as 'completed' | 'paused',
            };
          });
        
        setHistoryList(historyData);
      }
    } catch (error) {
      console.error('Error fetching fasting data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateStreaks]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchFastingData();
    
    if (!user) return;

    // Subscribe to real-time changes
    const channel = supabase
      .channel('fasting-sessions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fasting_sessions',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Refetch data when any change happens
        fetchFastingData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFastingData]);

  // Handle protocol selection and save to profile
  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ fasting_protocol: `${hours}h` })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating protocol:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o protocolo.',
        variant: 'destructive',
      });
    } else {
      refreshProfile?.();
    }
  };

  // Handle start fasting
  const handleStartFasting = async () => {
    await startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard');
    toast({
      title: 'Jejum iniciado!',
      description: `Meta de ${selectedProtocol} horas de jejum.`,
    });
  };

  // Handle stop fasting
  const handleStopFasting = async () => {
    await stopFasting();
    // Data will be refreshed via real-time subscription
  };

  // Handle delete session
  const handleDeleteSession = async () => {
    if (!user || !sessionToDelete) return;
    
    const sessionId = sessionToDelete;
    setSessionToDelete(null);
    
    // Optimistic UI update - remove immediately
    setHistoryList(prev => prev.filter(s => s.id !== sessionId));
    
    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) {
      // Revert on error - refetch data
      fetchFastingData();
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o jejum.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Jejum deletado',
        description: 'O registro foi removido.',
      });
    }
  };

  const time = formatTime(elapsedSeconds);

  const formatPausedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h${mins}min`;
  };

  const isLoading = loading || timerLoading;

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-muted/30 via-muted/10 to-transparent dark:from-primary/15 dark:via-primary/5" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-8" />
            <Link to="/profile">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 dark:ring-primary/30">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary/20 text-primary dark:bg-primary/10">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

          {/* Status Text */}
          <div className="text-center px-4 mt-4">
            <h2 className="text-2xl text-foreground font-semibold">
              {isActive ? 'Jejum em andamento' : 'Pronto pra começar'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </div>

          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center py-8"
          >
            <CircularProgress progress={isActive ? progress : 0} size={300} strokeWidth={16}>
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-7xl font-black tabular-nums tracking-tight text-foreground dark:text-primary dark:drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]">
                    {time.hours}
                  </span>
                  <span className="text-5xl font-bold text-foreground dark:text-primary mx-1">:</span>
                  <span className="text-7xl font-black tabular-nums tracking-tight text-foreground dark:text-primary dark:drop-shadow-[0_0_15px_rgba(132,204,22,0.3)]">
                    {time.minutes}
                  </span>
                  <span className="text-3xl font-semibold tabular-nums text-muted-foreground ml-1">
                    :{time.seconds}
                  </span>
                </div>
                
                {isActive ? (
                  <motion.div 
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-md border border-border dark:border-primary/20 shadow-lg dark:shadow-[0_0_20px_-5px_rgba(132,204,22,0.2)]"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Meta: {targetHours}h
                    </span>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="mt-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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

          <main className="px-4 space-y-4">
            {/* Action Button */}
            {!isActive ? (
              <Button
                onClick={handleStartFasting}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary/80 to-primary text-primary-foreground font-semibold text-base shadow-lg dark:shadow-[0_8px_30px_-10px_rgba(132,204,22,0.4)] press-effect"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button>
            ) : (
              <Button
                onClick={handleStopFasting}
                variant="outline"
                className="w-full h-14 rounded-2xl font-semibold text-base border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Pause className="mr-2 h-5 w-5" />
                Encerrar Jejum
              </Button>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-card border border-border dark:border-primary/10 text-center dark:hover:border-primary/20 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">Melhor sequência</p>
                    <p className="text-2xl font-bold text-foreground">{bestStreak} Dias</p>
                    <Flame className="h-5 w-5 mx-auto mt-2 text-primary" />
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-card border border-border dark:border-primary/10 text-center dark:hover:border-primary/20 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">Sequência atual</p>
                    <p className="text-2xl font-bold text-foreground">{currentStreak} Dias</p>
                    <Trophy className="h-5 w-5 mx-auto mt-2 text-primary" />
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-card border border-border dark:border-primary/10 text-center dark:hover:border-primary/20 transition-colors">
                    <p className="text-xs text-muted-foreground mb-1">Meta Semanal</p>
                    <p className="text-2xl font-bold text-foreground">{weeklyGoal.completed}/{weeklyGoal.target}</p>
                    <Target className="h-5 w-5 mx-auto mt-2 text-primary" />
                  </div>
                </>
              )}
            </div>

            {/* Fasting History List */}
            {historyList.length > 0 && !isActive && (
              <div className="space-y-3">
                {historyList.map((session) => (
                  <SwipeableRow
                    key={session.id}
                    onDelete={() => setSessionToDelete(session.id)}
                  >
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${session.status === 'completed' ? 'bg-[#84cc16]/20' : 'bg-orange-500/20'}`}>
                          <Pause className={`h-5 w-5 ${session.status === 'completed' ? 'text-[#84cc16]' : 'text-orange-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Início {new Date(session.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="font-semibold text-foreground truncate">
                            Jejum de {formatPausedTime(session.elapsed_minutes)} {session.status === 'completed' ? 'completo' : 'pausado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.end_time).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-medium ${session.progress >= 100 ? 'text-[#84cc16]' : 'text-orange-500'}`}>
                            {session.progress}% reach
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwipeableRow>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>

      <BottomNav />
      
      <DeleteConfirmationDrawer
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Deletar jejum?"
        description="Você perderá o registro deste jejum. Esta ação não pode ser desfeita."
      />
    </div>
  );
}
