import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { CircularProgress } from '@/components/CircularProgress';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Clock, Flame, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoImage from '@/assets/logo-cari.png';

interface PausedSession {
  id: string;
  start_time: string;
  end_time: string;
  target_hours: number;
  elapsed_minutes: number;
  progress: number;
}

export default function Fasting() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 7 });
  const [pausedSession, setPausedSession] = useState<PausedSession | null>(null);
  const [loading, setLoading] = useState(true);
  
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
    startFasting,
    stopFasting,
    formatTime,
    targetHours,
  } = useFastingTimer();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchFastingData = async () => {
      try {
        setLoading(true);
        
        // Fetch completed sessions for streaks
        const { data: sessions } = await supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('start_time', { ascending: false });
        
        if (sessions && sessions.length > 0) {
          // Calculate current streak
          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          for (let i = 0; i < sessions.length; i++) {
            const sessionDate = new Date(sessions[i].start_time);
            sessionDate.setHours(0, 0, 0, 0);
            
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            
            if (sessionDate.getTime() === expectedDate.getTime()) {
              streak++;
            } else {
              break;
            }
          }
          setCurrentStreak(streak);
          
          // Best streak (simplified - just use current for now or calculate)
          setBestStreak(Math.max(streak, 3));
        }
        
        // Weekly goal
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: weeklyData } = await supabase
          .from('fasting_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('start_time', sevenDaysAgo);
        
        setWeeklyGoal({ completed: weeklyData?.length || 0, target: 7 });
        
        // Fetch last paused session
        const { data: pausedData } = await supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'paused')
          .order('end_time', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (pausedData) {
          const start = new Date(pausedData.start_time);
          const end = new Date(pausedData.end_time!);
          const elapsedMs = end.getTime() - start.getTime();
          const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
          const targetMins = (pausedData.target_hours || 16) * 60;
          
          setPausedSession({
            id: pausedData.id,
            start_time: pausedData.start_time,
            end_time: pausedData.end_time!,
            target_hours: pausedData.target_hours || 16,
            elapsed_minutes: elapsedMins,
            progress: Math.round((elapsedMins / targetMins) * 100),
          });
        }
      } catch (error) {
        console.error('Error fetching fasting data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFastingData();
  }, [user]);

  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ fasting_protocol: `${hours}h` })
      .eq('id', user.id);
    
    if (!error) {
      refreshProfile?.();
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

  return (
    <div className="min-h-[100dvh] pb-24 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-8" />
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

          {/* Status Text */}
          <div className="text-center px-4 mt-4">
            <h2 className="text-2xl text-white font-semibold">
              {isActive ? 'Jejum em andamento' : 'Pronto pra começar'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </div>

          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center py-6"
          >
            <CircularProgress progress={isActive ? progress : 0} size={280} strokeWidth={20}>
              <div className="text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-6xl font-bold tabular-nums text-foreground">
                    {time.hours}:{time.minutes}
                  </span>
                  <span className="text-2xl font-medium tabular-nums text-muted-foreground ml-1">
                    :{time.seconds}
                  </span>
                </div>
                
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Meta: {isActive ? targetHours : selectedProtocol}h
                  </span>
                </div>
              </div>
            </CircularProgress>
          </motion.div>

          <main className="px-4 space-y-4">
            {/* Action Button */}
            {!isActive ? (
              <Button
                onClick={() => startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard')}
                className="w-full h-14 rounded-2xl bg-[#84cc16] hover:bg-[#65a30d] text-white font-semibold text-base shadow-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button>
            ) : (
              <Button
                onClick={stopFasting}
                variant="outline"
                className="w-full h-14 rounded-2xl font-semibold text-base border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Pause className="mr-2 h-5 w-5" />
                Encerrar Jejum
              </Button>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Melhor sequência</p>
                    <p className="text-2xl font-bold text-foreground">{bestStreak} Dias</p>
                    <Flame className="h-5 w-5 mx-auto mt-2 text-[#84cc16]" />
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Sequência atual</p>
                    <p className="text-2xl font-bold text-foreground">{currentStreak} Dias</p>
                    <Trophy className="h-5 w-5 mx-auto mt-2 text-[#84cc16]" />
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-card border border-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Meta Semanal</p>
                    <p className="text-2xl font-bold text-foreground">{weeklyGoal.completed}/{weeklyGoal.target}</p>
                    <Target className="h-5 w-5 mx-auto mt-2 text-[#84cc16]" />
                  </div>
                </>
              )}
            </div>

            {/* Last Paused Session */}
            {pausedSession && !isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-8 bg-[#84cc16] rounded-full" />
                    <div className="w-1.5 h-8 bg-[#84cc16] rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      Inicio {new Date(pausedSession.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="font-semibold text-foreground">
                      Jejum de {formatPausedTime(pausedSession.elapsed_minutes)} pausado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pausedSession.end_time).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#84cc16]">{pausedSession.progress}% reach</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab Navigation */}
            <div className="flex mt-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 pb-3 text-center text-green-800 font-medium relative"
              >
                Dieta
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-800 rounded-full" />
              </button>
              <button className="flex-1 pb-3 text-center text-green-900 font-medium relative">
                Jejum
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#84cc16] rounded-full" />
              </button>
            </div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
