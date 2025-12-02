import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Target, Trophy, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface DayActivity {
  date: Date;
  count: number;
  intensity: number;
}

export default function Progress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, total: 7 });
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState('--');
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [achievements, setAchievements] = useState<Array<{ emoji: string; title: string; description: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

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
      const achievementsList: Array<{ emoji: string; title: string; description: string }> = [];

      if (finishedFasts.length > 0) {
        finishedFasts.slice(-5).reverse().forEach(fast => {
          const start = new Date(fast.start_time);
          const end = new Date(fast.end_time!);
          const hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
          const minutes = Math.floor(((end.getTime() - start.getTime()) / (1000 * 60)) % 60);
          
          // Verificar se foi concluído (atingiu a meta) ou pausado
          const wasCompleted = fast.status === 'completed' || hours >= (fast.target_hours || 16);
          
          achievementsList.push({
            emoji: wasCompleted ? '🔥' : '⏸️',
            title: wasCompleted 
              ? `Jejum de ${hours}h concluído`
              : `Jejum de ${hours}h${minutes > 0 ? `${minutes}min` : ''} pausado`,
            description: new Date(fast.end_time!).toLocaleDateString('pt-BR'),
          });
        });
      }

      if (achievementsList.length === 0) {
        achievementsList.push({
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

  // Group heatmap data into weeks
  const weeks: DayActivity[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const stats = [
    { icon: Flame, label: 'Sequência atual', value: `${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`, color: 'text-secondary' },
    { icon: Target, label: 'Meta semanal', value: `${weeklyGoal.current}/${weeklyGoal.total}`, color: 'text-primary' },
    { icon: Trophy, label: 'Melhor sequência', value: `${bestStreak} ${bestStreak === 1 ? 'dia' : 'dias'}`, color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'Taxa de sucesso', value: successRate, color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 pt-11 pb-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Progresso</h1>
              <p className="text-muted-foreground">
                Últimos 90 dias até {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                {selectedDate.toDateString() === new Date().toDateString() && ' (Hoje)'}
              </p>
            </div>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center press-effect hover:bg-accent transition-colors">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                      toast({
                        title: '📅 Data selecionada',
                        description: `Mostrando progresso até ${format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
                      });
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {loading ? (
              <>
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
                <Skeleton className="h-28 rounded-2xl" />
              </>
            ) : (
              stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl bg-card border border-border"
                >
                  <stat.icon className={cn("h-5 w-5 mb-2", stat.color)} />
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
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Contribution Graph
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
                        day.intensity === 1 && "bg-secondary/30",
                        day.intensity === 2 && "bg-secondary/60",
                        day.intensity === 3 && "bg-secondary/90",
                        day.intensity === 4 && "bg-secondary"
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
                  <div className="w-3 h-3 rounded-sm bg-secondary/30" />
                  <div className="w-3 h-3 rounded-sm bg-secondary/50" />
                  <div className="w-3 h-3 rounded-sm bg-secondary/70" />
                  <div className="w-3 h-3 rounded-sm bg-secondary" />
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
            <h2 className="text-lg font-semibold text-foreground mb-4">
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
                <div
                  key={`${achievement.title}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <span className="text-2xl">{achievement.emoji}</span>
                  <div>
                    <p className="font-medium text-foreground">{achievement.title}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
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
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
