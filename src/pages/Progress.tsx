import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { MoodCheckInDrawer } from '@/components/diary/MoodCheckInDrawer';
import { WeightInputDialog } from '@/components/diary/WeightInputDialog';
import { WaterInputDialog } from '@/components/diary/WaterInputDialog';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Target, Trophy, TrendingUp, CalendarDays, ChartBar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedDate } from '@/contexts/DateContext';
import { toast } from '@/hooks/use-toast';
import { EmotionTag } from '@/types';
import { AppHeader } from '@/components/AppHeader';
import { QuickAssessmentBar } from '@/components/diary/QuickAssessmentBar';

interface DayActivity {
  date: Date;
  count: number;
  intensity: number;
}

export default function Progress() {
  const { user, profile } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const [loading, setLoading] = useState(true);

  // Progress stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, total: 7 });
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState('--');
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [achievements, setAchievements] = useState<Array<{
    id: string;
    iconType: 'completed' | 'paused';
    title: string;
    description: string;
  }>>([]);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  // Diary states
  const [moodDrawerOpen, setMoodDrawerOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch progress data (90 days)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProgressData = async () => {
      try {
        const referenceDate = new Date(selectedDate);
        referenceDate.setHours(23, 59, 59, 999);
        const ninetyDaysAgo = new Date(referenceDate);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const { data: fastingSessions, error: fastingError } = await supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (fastingError) {
          console.error('Error fetching data:', fastingError);
          return;
        }

        const activeDays = new Map<string, number>();
        fastingSessions?.forEach(session => {
          const date = new Date(session.created_at).toDateString();
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
          const cd = new Date(startOfWeek);
          cd.setDate(cd.getDate() + i);
          if (activeDays.has(cd.toDateString())) {
            weeklyCount++;
          }
        }
        setWeeklyGoal({ current: weeklyCount, total: 7 });

        // Calculate success rate
        const completedFasts = fastingSessions?.filter(s => s.end_time !== null).length || 0;
        const totalFasts = fastingSessions?.length || 0;
        const rate = totalFasts > 0 ? Math.round(completedFasts / totalFasts * 100) : 0;
        setSuccessRate(totalFasts > 0 ? `${rate}%` : '--');

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

        // Generate achievements
        const finishedFasts = fastingSessions?.filter(s => s.end_time !== null) || [];
        const achievementsList: Array<{
          id: string;
          iconType: 'completed' | 'paused';
          title: string;
          description: string;
        }> = [];
        if (finishedFasts.length > 0) {
          finishedFasts.slice(-5).reverse().forEach(fast => {
            const start = new Date(fast.start_time);
            const end = new Date(fast.end_time!);
            const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const wasCompleted = fast.status === 'completed' || hours >= (fast.target_hours || 16);
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
              iconType: wasCompleted ? 'completed' : 'paused',
              title: wasCompleted ? `Jejum de ${timeText} concluído` : `Jejum de ${timeText} pausado`,
              description: new Date(fast.end_time!).toLocaleDateString('pt-BR')
            });
          });
        }
        setAchievements(achievementsList);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [user, selectedDate, refetchTrigger]);

  // Handlers
  const handleMoodSubmit = async (data: { energyLevel: number; emotion: EmotionTag }) => {
    if (!user) return;
    const { error } = await supabase.from('mood_logs').insert({
      user_id: user.id,
      mood: data.emotion,
      energy_level: data.energyLevel
    });
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    setRefetchTrigger(p => p + 1);
    toast({ title: '🧠 Check-in registrado' });
  };

  const handleWaterSubmit = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('water_logs').insert({
      user_id: user.id,
      amount_ml: amount
    });
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    setRefetchTrigger(p => p + 1);
    toast({ title: '💧 Água registrada', description: `+${amount}ml` });
  };

  const handleWeightSubmit = async (weight: number) => {
    if (!user) return;
    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      weight: weight
    });
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    await supabase.from('profiles').update({ weight }).eq('id', user.id);
    setRefetchTrigger(p => p + 1);
    toast({ title: '⚖️ Peso registrado', description: `${weight}kg` });
  };

  const handleDeleteAchievement = async () => {
    if (!user || !achievementToDelete || achievementToDelete === 'empty') return;
    const idToDelete = achievementToDelete;
    setAchievementToDelete(null);
    setAchievements(prev => prev.filter(a => a.id !== idToDelete));
    const { error } = await supabase.from('fasting_sessions').delete().eq('id', idToDelete);
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    toast({ title: '🗑️ Jejum removido' });
  };

  const weeks: DayActivity[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const stats = [{
    icon: Flame,
    label: 'Sequência',
    value: `${currentStreak}d`
  }, {
    icon: Target,
    label: 'Meta Semanal',
    value: `${weeklyGoal.current}/${weeklyGoal.total}`
  }, {
    icon: Trophy,
    label: 'Melhor',
    value: `${bestStreak}d`
  }, {
    icon: TrendingUp,
    label: 'Taxa',
    value: successRate
  }];

  return (
    <div className="min-h-[100dvh] bg-background relative pb-24">
      {/* Premium gradient header with depth */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="mx-auto max-w-lg relative">
        <div className="relative z-10">
          <AppHeader className="pt-[5px] py-0" />

          <div className="mt-4">
            <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>

          {/* Stats Row */}
          <div className="px-4 mt-6 grid grid-cols-4 gap-2">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 text-center">
                <stat.icon className="h-4 w-4 mx-auto text-lime-500 mb-1" />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="heatmap" className="mt-6 px-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="heatmap" className="gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Heatmap</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Conquistas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="mt-4">
              {/* Quick assessment bar */}
              <QuickAssessmentBar
                onMoodClick={() => setMoodDrawerOpen(true)}
                onWeightClick={() => setWeightDialogOpen(true)}
                onWaterClick={() => setWaterDialogOpen(true)}
              />

              <div className="p-4 rounded-xl bg-card/80 border border-border/60 mt-4">
                <h3 className="font-semibold text-foreground mb-3">Atividade de Jejum (90 dias)</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 min-w-max">
                    {weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-1">
                        {week.map((day, dayIdx) => (
                          <div
                            key={dayIdx}
                            className={cn(
                              'w-3 h-3 rounded-sm',
                              day.intensity === 0 && 'bg-muted',
                              day.intensity === 1 && 'bg-lime-500/30',
                              day.intensity === 2 && 'bg-lime-500/50',
                              day.intensity === 3 && 'bg-lime-500/70',
                              day.intensity >= 4 && 'bg-lime-500'
                            )}
                            title={`${day.date.toLocaleDateString('pt-BR')}: ${day.count} registros`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Menos</span>
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm bg-muted" />
                    <div className="w-3 h-3 rounded-sm bg-lime-500/30" />
                    <div className="w-3 h-3 rounded-sm bg-lime-500/50" />
                    <div className="w-3 h-3 rounded-sm bg-lime-500/70" />
                    <div className="w-3 h-3 rounded-sm bg-lime-500" />
                  </div>
                  <span>Mais</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-4 space-y-3">
              {achievements.length > 0 ? (
                achievements.map(achievement => (
                  <SwipeableRow key={achievement.id} onDelete={() => setAchievementToDelete(achievement.id)}>
                    <div className="p-4 rounded-xl bg-card/80 border border-border/60 flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        achievement.iconType === 'completed' ? 'bg-lime-500/20' : 'bg-orange-500/20'
                      )}>
                        <Trophy className={cn(
                          'h-5 w-5',
                          achievement.iconType === 'completed' ? 'text-lime-500' : 'text-orange-500'
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  </SwipeableRow>
                ))
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhuma conquista ainda</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete jejuns para ganhar conquistas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />

      {/* Dialogs */}
      <MoodCheckInDrawer open={moodDrawerOpen} onOpenChange={setMoodDrawerOpen} onSubmit={handleMoodSubmit} />
      <WeightInputDialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen} onSubmit={handleWeightSubmit} lastWeight={profile?.weight || 70} />
      <WaterInputDialog open={waterDialogOpen} onOpenChange={setWaterDialogOpen} onSubmit={handleWaterSubmit} />
      <DeleteConfirmationDrawer open={!!achievementToDelete} onOpenChange={open => !open && setAchievementToDelete(null)} onConfirm={handleDeleteAchievement} title="Deletar conquista?" description="Esta ação removerá o registro do jejum." />
    </div>
  );
}
