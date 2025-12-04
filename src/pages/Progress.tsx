import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import logoImage from '@/assets/logo-cari.png';

interface DayActivity {
  date: Date;
  count: number;
  intensity: number;
}

export default function Progress() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, total: 7 });
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState('--');
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [achievements, setAchievements] = useState<Array<{ id: string; emoji: string; title: string; description: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const referenceDate = new Date(selectedDate);
        referenceDate.setHours(23, 59, 59, 999);
        const ninetyDaysAgo = new Date(referenceDate);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Fetch fasting sessions
        const { data: fastingSessions, error: fastingError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Fetch meal logs
      const { data: mealLogs, error: mealError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (fastingError || mealError) {
        console.error('Error fetching data:', fastingError || mealError);
        toast({
          title: '❌ Erro ao carregar',
          description: 'Não foi possível carregar os dados de progresso.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Process data
      const activeDays = new Map<string, number>();
      
      // Count activities per day
      fastingSessions?.forEach(session => {
        const date = new Date(session.created_at).toDateString();
        activeDays.set(date, (activeDays.get(date) || 0) + 1);
      });

      mealLogs?.forEach(log => {
        const date = new Date(log.created_at).toDateString();
        activeDays.set(date, (activeDays.get(date) || 0) + 1);
      });

      // Calculate current streak
      let streak = 0;
      let checkDate = new Date(selectedDate);
      checkDate.setHours(0, 0, 0, 0);
      
      while (true) {
        const dateStr = checkDate.toDateString();
        if (activeDays.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      setCurrentStreak(streak);

      // Calculate best streak
      const sortedDates = Array.from(activeDays.keys()).sort();
      let maxStreak = 0;
      let tempStreak = 0;
      let lastDate: Date | null = null;

      sortedDates.forEach(dateStr => {
        const currentDate = new Date(dateStr);
        
        if (lastDate) {
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        
        lastDate = currentDate;
      });
      maxStreak = Math.max(maxStreak, tempStreak);
      setBestStreak(maxStreak);

      // Calculate weekly goal
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);

      let weeklyCount = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(startOfWeek);
        checkDate.setDate(checkDate.getDate() + i);
        if (activeDays.has(checkDate.toDateString())) {
          weeklyCount++;
        }
      }
      setWeeklyGoal({ current: weeklyCount, total: 7 });

      // Calculate success rate
      const completedFasts = fastingSessions?.filter(s => s.end_time !== null).length || 0;
      const totalFasts = fastingSessions?.length || 0;
      const rate = totalFasts > 0 ? Math.round((completedFasts / totalFasts) * 100) : 0;
      setSuccessRate(totalFasts > 0 ? `${rate}%` : '--%');

      // Generate heatmap data
      const heatmap: DayActivity[] = [];
      for (let i = 0; i < 91; i++) {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() - (90 - i));
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toDateString();
        const count = activeDays.get(dateStr) || 0;
        const intensity = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count >= 3 ? 3 : 4;
        heatmap.push({ date, count, intensity });
      }
      setHeatmapData(heatmap);

      // Generate achievements - separar concluídos e pausados
      const finishedFasts = fastingSessions?.filter(s => s.end_time !== null) || [];
      const achievementsList: Array<{ id: string; emoji: string; title: string; description: string }> = [];

      if (finishedFasts.length > 0) {
        finishedFasts.slice(-5).reverse().forEach(fast => {
          const start = new Date(fast.start_time);
          const end = new Date(fast.end_time!);
          const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          
          // Verificar se foi concluído (atingiu a meta) ou pausado
          const wasCompleted = fast.status === 'completed' || hours >= (fast.target_hours || 16);
          
          // Formatar tempo com horas e minutos
          let timeText = '';
          if (hours > 0 && minutes > 0) {
            timeText = `${hours}h${minutes}min`;
          } else if (hours > 0) {
            timeText = `${hours}h`;
          } else {
            timeText = `${minutes}min`;
          }
          
          achievementsList.push({
            id: fast.id,
            emoji: wasCompleted ? '🔥' : '⏸️',
            title: wasCompleted 
              ? `Jejum de ${timeText} concluído`
              : `Jejum de ${timeText} pausado`,
            description: new Date(fast.end_time!).toLocaleDateString('pt-BR'),
          });
        });
      }

      if (achievementsList.length === 0) {
        achievementsList.push({
          id: 'empty',
          emoji: '🎯',
          title: 'Comece sua jornada',
          description: 'Complete seu primeiro jejum para ganhar medalhas',
        });
      }

      setAchievements(achievementsList);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: '❌ Erro inesperado',
          description: 'Ocorreu um erro ao processar os dados.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription for automatic updates
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fasting_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate]);

  const handleDeleteFasting = async () => {
    if (!user || !achievementToDelete || achievementToDelete === 'empty') return;

    const idToDelete = achievementToDelete;
    setAchievementToDelete(null);

    // Optimistic update
    setAchievements(prev => prev.filter(a => a.id !== idToDelete));

    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', idToDelete);

    if (error) {
      console.error('Error deleting fasting session:', error);
      toast({
        title: '❌ Erro ao deletar',
        description: 'Não foi possível remover o jejum',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '🗑️ Jejum removido',
      description: 'O registro de jejum foi apagado',
    });
  };

  // Group heatmap data into weeks
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const stats = [
    { icon: Flame, label: 'Sequência atual', value: `${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`, color: 'text-[#84cc16]' },
    { icon: Target, label: 'Meta semanal', value: `${weeklyGoal.current}/${weeklyGoal.total}`, color: 'text-[#84cc16]' },
    { icon: Trophy, label: 'Melhor sequência', value: `${bestStreak} ${bestStreak === 1 ? 'dia' : 'dias'}`, color: 'text-[#84cc16]' },
    { icon: TrendingUp, label: 'Taxa de sucesso', value: successRate, color: 'text-[#84cc16]' },
  ];

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
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
            <h2 className="text-2xl text-white font-semibold">Seu Progresso</h2>
            <p className="text-white/60 text-sm mt-1">
              Últimos 90 dias até {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          <main className="px-4 pt-6 space-y-4">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              {loading ? (
                <>
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </>
              ) : (
                stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-2xl bg-card border border-border text-center"
                  >
                    <stat.icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))
              )}
            </motion.div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <h2 className="text-base font-semibold text-foreground mb-4">
                Gráfico de Atividades
              </h2>
              
              {loading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : (
                <>
                  <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                          <motion.div
                            key={`${weekIndex}-${dayIndex}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 + weekIndex * 0.02 + dayIndex * 0.01 }}
                            className={cn(
                              "w-4 h-4 rounded-sm transition-colors cursor-pointer",
                              day.intensity === 0 && "bg-muted",
                              day.intensity === 1 && "bg-[#84cc16]/30",
                              day.intensity === 2 && "bg-[#84cc16]/50",
                              day.intensity === 3 && "bg-[#84cc16]/70",
                              day.intensity === 4 && "bg-[#84cc16]"
                            )}
                            title={`${day.date.toLocaleDateString('pt-BR')} - ${day.count} ${day.count === 1 ? 'atividade' : 'atividades'}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                    <span>Menos</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-sm bg-muted" />
                      <div className="w-3 h-3 rounded-sm bg-[#84cc16]/30" />
                      <div className="w-3 h-3 rounded-sm bg-[#84cc16]/50" />
                      <div className="w-3 h-3 rounded-sm bg-[#84cc16]/70" />
                      <div className="w-3 h-3 rounded-sm bg-[#84cc16]" />
                    </div>
                    <span>Mais</span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <h2 className="text-base font-semibold text-foreground mb-4">
                Conquistas recentes
              </h2>
              
              {loading ? (
                <>
                  <Skeleton className="h-16 rounded-xl mb-3" />
                  <Skeleton className="h-16 rounded-xl mb-3" />
                  <Skeleton className="h-16 rounded-xl" />
                </>
              ) : achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <SwipeableRow onDelete={() => setAchievementToDelete(achievement.id)}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <span className="text-2xl">{achievement.emoji}</span>
                          <div>
                            <p className="font-medium text-foreground">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </SwipeableRow>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    Nenhuma conquista ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Complete jejuns e registre refeições para desbloquear conquistas
                  </p>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>

      <DeleteConfirmationDrawer
        open={!!achievementToDelete}
        onOpenChange={(open) => !open && setAchievementToDelete(null)}
        onConfirm={handleDeleteFasting}
        title="Deletar jejum?"
        description="Este registro de jejum será removido permanentemente do seu histórico."
      />

      <BottomNav />
    </div>
  );
}
