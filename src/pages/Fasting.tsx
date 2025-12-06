import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { useSelectedDate } from '@/contexts/DateContext';
import { AppHeader } from '@/components/AppHeader';
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
  const {
    user,
    profile,
    refreshProfile
  } = useAuth();
  const {
    selectedDate,
    setSelectedDate
  } = useSelectedDate();
  const navigate = useNavigate();
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({
    completed: 0,
    target: 7
  });
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
    loading: timerLoading
  } = useFastingTimer();

  // Calculate streaks from sessions
  const calculateStreaks = useCallback((sessions: FastingSession[]) => {
    if (!sessions || sessions.length === 0) {
      setBestStreak(0);
      setCurrentStreak(0);
      return;
    }

    // Filter completed sessions and sort by date
    const completedSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
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
    const sortedDays = Array.from(uniqueDays).map(d => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m, day);
    }).sort((a, b) => b.getTime() - a.getTime());

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
      const {
        data: sessions,
        error: sessionsError
      } = await supabase.from('fasting_sessions').select('*').eq('user_id', user.id).order('start_time', {
        ascending: false
      });
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seu histórico de jejum.',
          variant: 'destructive'
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
        const weeklyCompleted = sessions.filter(s => s.status === 'completed' && new Date(s.start_time) >= sevenDaysAgo).length;
        setWeeklyGoal({
          completed: weeklyCompleted,
          target: 7
        });

        // Build history list from completed and paused sessions
        const historyData = sessions.filter(s => s.status === 'completed' || s.status === 'paused').filter(s => s.end_time) // Only sessions with end time
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
            progress: Math.round(elapsedMins / targetMins * 100),
            status: session.status as 'completed' | 'paused'
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
    const channel = supabase.channel('fasting-sessions-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'fasting_sessions',
      filter: `user_id=eq.${user.id}`
    }, () => {
      // Refetch data when any change happens
      fetchFastingData();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFastingData]);

  // Handle protocol selection and save to profile
  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    if (!user) return;
    const {
      error
    } = await supabase.from('profiles').update({
      fasting_protocol: `${hours}h`
    }).eq('id', user.id);
    if (error) {
      console.error('Error updating protocol:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o protocolo.',
        variant: 'destructive'
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
      description: `Meta de ${selectedProtocol} horas de jejum.`
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
    const {
      error
    } = await supabase.from('fasting_sessions').delete().eq('id', sessionId).eq('user_id', user.id);
    if (error) {
      // Revert on error - refetch data
      fetchFastingData();
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar o jejum.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Jejum deletado',
        description: 'O registro foi removido.'
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
  return <div className="min-h-[100dvh] bg-background relative">
      {/* Premium gradient header with depth */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="mx-auto max-w-lg relative">
        
        <div className="relative z-10">
          <AppHeader />

          <div className="mt-4">
            <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>

          {/* Status Text */}
          <div className="text-center px-4 mt-4">
            <h2 className="text-2xl text-white font-semibold">
              {isActive ? 'Jejum em andamento' : 'Pronto pra começar'}
            </h2>
            <p className="mt-1 text-lime-800 dark:text-lime-500 font-bold">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </div>

          {/* Timer Section */}
          <div className="flex flex-col items-center py-6 px-4">
            <CircularProgress progress={isActive ? progress : 0} size={260} strokeWidth={14}>
              <div className="flex items-baseline justify-center">
                <span className="text-6xl font-black tabular-nums text-green-700">
                  {time.hours}
                </span>
                <span className="text-4xl font-bold mx-1 text-green-700">:</span>
                <span className="text-6xl font-black tabular-nums text-green-700">
                  {time.minutes}
                </span>
                <span className="text-2xl font-semibold tabular-nums ml-1 text-green-700">
                  :{time.seconds}
                </span>
              </div>
            </CircularProgress>

            {/* Meta Badge */}
            <div className="mt-5">
              {isActive ? <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/20 border border-green-500/40">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-500">Meta: {targetHours}h</span>
                </div> : <ProtocolSelector selectedHours={selectedProtocol} onSelect={handleProtocolSelect} isOpen={isProtocolOpen} onOpenChange={setIsProtocolOpen} />}
            </div>
          </div>

          <main className="px-4 space-y-4 pb-[20px] mb-[20px]">
            {/* Action Button */}
            {!isActive ? <Button onClick={handleStartFasting} className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg bg-green-700 hover:bg-green-600">
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button> : <Button onClick={handleStopFasting} variant="outline" className="w-full h-14 rounded-2xl font-semibold text-base border-red-400/50 text-red-400 hover:bg-red-400/10">
                <Pause className="mr-2 h-5 w-5" />
                Encerrar Jejum
              </Button>}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {isLoading ? <>
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                </> : <>
                  <div className="relative p-4 rounded-2xl bg-white dark:bg-card text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)]">
                    <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400" />
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mt-2 mb-2">Melhor sequência</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">{bestStreak}</p>
                    <div className="mt-3 flex justify-center">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-orange-400/20 to-red-500/20">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative p-4 rounded-2xl bg-white dark:bg-card text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)]">
                    <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400" />
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mt-2 mb-2">Sequência atual</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">{currentStreak}</p>
                    <div className="mt-3 flex justify-center">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative p-4 rounded-2xl bg-white dark:bg-card text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)]">
                    <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r from-lime-400 via-lime-300 to-lime-400" />
                    <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mt-2 mb-2">Meta Semanal</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">{weeklyGoal.completed}<span className="text-lg font-bold text-lime-500">/{weeklyGoal.target}</span></p>
                    <div className="mt-3 flex justify-center">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20">
                        <Target className="h-5 w-5 text-lime-500" />
                      </div>
                    </div>
                  </div>
                </>}
            </div>

            {/* Fasting History List */}
            {historyList.length > 0 && !isActive && <div className="space-y-3">
                {historyList.map(session => <SwipeableRow key={session.id} onDelete={() => setSessionToDelete(session.id)}>
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${session.status === 'completed' ? 'bg-lime-500/20' : 'bg-orange-500/20'}`}>
                          <Pause className={`h-5 w-5 ${session.status === 'completed' ? 'text-lime-500' : 'text-orange-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Início {new Date(session.start_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </p>
                          <p className="font-semibold text-foreground truncate">
                            Jejum de {formatPausedTime(session.elapsed_minutes)} {session.status === 'completed' ? 'completo' : 'pausado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.end_time).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-medium ${session.progress >= 100 ? 'text-lime-500' : 'text-orange-500'}`}>
                            {session.progress}% reach
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwipeableRow>)}
              </div>}

          </main>
        </div>
      </div>

      <BottomNav />
      
      <DeleteConfirmationDrawer open={!!sessionToDelete} onOpenChange={open => !open && setSessionToDelete(null)} onConfirm={handleDeleteSession} title="Deletar jejum?" description="Você perderá o registro deste jejum. Esta ação não pode ser desfeita." />
    </div>;
}