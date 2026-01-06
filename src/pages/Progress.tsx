import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { QuickAssessmentBar } from '@/components/diary/QuickAssessmentBar';
import { MoodCheckInDrawer } from '@/components/diary/MoodCheckInDrawer';
import { WeightInputDialog } from '@/components/diary/WeightInputDialog';
import { WaterInputDialog } from '@/components/diary/WaterInputDialog';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { MealEditDialog } from '@/components/diary/MealEditDialog';
import { TimelineEntryCard } from '@/components/diary/TimelineEntryCard';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Target, Trophy, TrendingUp, Coffee, CalendarDays, ListTodo, ChartBar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedDate } from '@/contexts/DateContext';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry, EmotionTag } from '@/types';
import { AppHeader } from '@/components/AppHeader';

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
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [mealEditDialogOpen, setMealEditDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<TimelineEntry | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [entryToDelete, setEntryToDelete] = useState<TimelineEntry | null>(null);

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

        const { data: mealLogs, error: mealError } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (fastingError || mealError) {
          console.error('Error fetching data:', fastingError || mealError);
          return;
        }

        const activeDays = new Map<string, number>();
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

  // Fetch daily timeline
  useEffect(() => {
    if (!user) return;
    const fetchLogsForDate = async () => {
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startOfDay.toISOString())
          .lte('logged_at', endOfDay.toISOString())
          .order('logged_at', { ascending: false });

        if (error) {
          console.error('Error fetching meal logs:', error);
          return;
        }
        if (data) {
          const entries: TimelineEntry[] = data.map(log => {
            const status = (log.analysis_status === 'pending' || log.analysis_status === 'analyzed' || log.analysis_status === 'error' || log.analysis_status === 'manual') 
              ? log.analysis_status as 'pending' | 'analyzed' | 'error' | 'manual'
              : 'manual' as const;
            return {
              id: log.id,
              type: 'meal' as const,
              time: new Date(log.logged_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              created_at: log.created_at,
              entry_method: log.image_url ? 'ai' as const : 'manual' as const,
              food_name: log.description || '',
              description: log.description || '',
              calories: log.calories || 0,
              image_url: log.image_url,
              macros: {
                protein: log.protein || 0,
                carbs: log.carbs || 0,
                fat: log.fat || 0
              },
              status
            };
          });
          setTimeline(entries);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };
    fetchLogsForDate();
    const channel = supabase.channel('meal-logs-progress').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'meal_logs',
      filter: `user_id=eq.${user.id}`
    }, () => {
      fetchLogsForDate();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate, refetchTrigger]);

  const todayCalories = timeline.filter(e => e.type === 'meal').reduce((sum, e) => sum + (e.calories || 0), 0);
  const todayMeals = timeline.filter(e => e.type === 'meal').length;
  const waterTotal = timeline.filter(e => e.type === 'water').reduce((sum, e) => sum + (e.value || 0), 0);
  const lastWeight = timeline.filter(e => e.type === 'weight').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.value || 0;

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

  const handleMealSubmit = async (data: {
    method: 'ai' | 'manual';
    description: string;
    calories?: number;
    imageUrl?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      description: data.description,
      calories: data.calories || 0,
      image_url: data.imageUrl || null,
      meal_type: 'meal',
      analysis_status: 'manual'
    });
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    setRefetchTrigger(p => p + 1);
    toast({ title: '🍎 Refeição registrada' });
  };

  const handleDeleteEntry = async () => {
    if (!user || !entryToDelete) return;
    const entryId = entryToDelete.id;
    setEntryToDelete(null);
    setTimeline(prev => prev.filter(e => e.id !== entryId));
    const { error } = await supabase.from('meal_logs').delete().eq('id', entryId);
    if (error) {
      setRefetchTrigger(p => p + 1);
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    toast({ title: '🗑️ Registro apagado' });
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

  const handleEditMeal = (entry: TimelineEntry) => {
    setEditingMeal(entry);
    setMealEditDialogOpen(true);
  };

  const handleMealEditSubmit = async (data: {
    food_name: string;
    calories: number;
    is_emotional: boolean;
  }) => {
    if (!user || !editingMeal) return;
    const { error } = await supabase.from('meal_logs').update({
      description: data.food_name,
      calories: data.calories
    }).eq('id', editingMeal.id);
    if (error) {
      toast({ title: '❌ Erro', variant: 'destructive' });
      return;
    }
    setRefetchTrigger(p => p + 1);
    toast({ title: '✅ Atualizado' });
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
          <Tabs defaultValue="timeline" className="mt-6 px-4">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="timeline" className="gap-1.5">
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Diário</span>
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="gap-1.5">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Heatmap</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Conquistas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4 space-y-4">
              <QuickAssessmentBar
                onMoodClick={() => setMoodDrawerOpen(true)}
                onWeightClick={() => setWeightDialogOpen(true)}
                onWaterClick={() => setWaterDialogOpen(true)}
                onMealClick={() => setMealDialogOpen(true)}
              />

              {/* Daily Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-card/80 border border-border/60 text-center">
                  <p className="text-lg font-bold text-foreground">{todayCalories}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div className="p-3 rounded-xl bg-card/80 border border-border/60 text-center">
                  <p className="text-lg font-bold text-foreground">{todayMeals}</p>
                  <p className="text-xs text-muted-foreground">refeições</p>
                </div>
                <div className="p-3 rounded-xl bg-card/80 border border-border/60 text-center">
                  <p className="text-lg font-bold text-foreground">{waterTotal}</p>
                  <p className="text-xs text-muted-foreground">ml água</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {loading ? (
                  <>
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </>
                ) : timeline.length > 0 ? (
                  timeline.map(entry => (
                    <SwipeableRow key={entry.id} onDelete={() => setEntryToDelete(entry)}>
                      <TimelineEntryCard entry={entry} onEdit={() => handleEditMeal(entry)} />
                    </SwipeableRow>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Coffee className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum registro hoje</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-4">
              <div className="p-4 rounded-xl bg-card/80 border border-border/60">
                <h3 className="font-semibold text-foreground mb-3">Atividade (90 dias)</h3>
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
      <MealInputDialog open={mealDialogOpen} onOpenChange={setMealDialogOpen} onSubmit={handleMealSubmit} />
      <MealEditDialog 
        open={mealEditDialogOpen} 
        onOpenChange={setMealEditDialogOpen} 
        initialData={{
          food_name: editingMeal?.food_name || '',
          calories: editingMeal?.calories,
          is_emotional: editingMeal?.is_emotional
        }}
        onSubmit={handleMealEditSubmit} 
      />
      <DeleteConfirmationDrawer open={!!entryToDelete} onOpenChange={open => !open && setEntryToDelete(null)} onConfirm={handleDeleteEntry} title="Deletar registro?" description="Esta ação não pode ser desfeita." />
      <DeleteConfirmationDrawer open={!!achievementToDelete} onOpenChange={open => !open && setAchievementToDelete(null)} onConfirm={handleDeleteAchievement} title="Deletar conquista?" description="Esta ação removerá o registro do jejum." />
    </div>
  );
}
