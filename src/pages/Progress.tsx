import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Target, Trophy, TrendingUp, Coffee, CalendarDays, ListTodo, ChartBar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry, EmotionTag } from '@/types';
import logoImage from '@/assets/logo-cari.png';

interface DayActivity {
  date: Date;
  count: number;
  intensity: number;
}

export default function Progress() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Progress stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, total: 7 });
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState('--');
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [achievements, setAchievements] = useState<Array<{ id: string; emoji: string; title: string; description: string }>>([]);
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
        const rate = totalFasts > 0 ? Math.round((completedFasts / totalFasts) * 100) : 0;
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
        const achievementsList: Array<{ id: string; emoji: string; title: string; description: string }> = [];

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
              emoji: wasCompleted ? '🔥' : '⏸️',
              title: wasCompleted 
                ? `Jejum de ${timeText} concluído`
                : `Jejum de ${timeText} pausado`,
              description: new Date(fast.end_time!).toLocaleDateString('pt-BR'),
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
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching meal logs:', error);
          return;
        }

        if (data) {
          const entries: TimelineEntry[] = data.map(log => {
            const baseEntry = {
              id: log.id,
              time: new Date(log.created_at).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              created_at: log.created_at,
            };

            if (log.entry_type === 'meal') {
              return {
                ...baseEntry,
                type: 'meal' as const,
                entry_method: log.image_url ? 'ai' as const : 'manual' as const,
                food_name: log.food_name || '',
                calories: log.calories || 0,
                image_url: log.image_url,
                is_emotional: log.is_emotional || false,
                hunger_level: log.hunger_level,
                ai_analysis: typeof log.ai_analysis === 'string' ? log.ai_analysis : log.ai_analysis as any,
                status: log.status || 'manual',
              };
            } else if (log.entry_type === 'water') {
              return { ...baseEntry, type: 'water' as const, value: log.metric_value || 0 };
            } else if (log.entry_type === 'weight') {
              return { ...baseEntry, type: 'weight' as const, value: log.metric_value || 0 };
            } else if (log.entry_type === 'mood') {
              return {
                ...baseEntry,
                type: 'mood' as const,
                mood_score: log.hunger_level || 5,
                emotion_tag: (log.mood_tag || 'calmo') as EmotionTag,
              };
            }

            return baseEntry as TimelineEntry;
          });
          
          setTimeline(entries);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchLogsForDate();

    const channel = supabase
      .channel('meal-logs-progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_logs', filter: `user_id=eq.${user.id}` },
        () => { fetchLogsForDate(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedDate, refetchTrigger]);

  const todayCalories = timeline.filter(e => e.type === 'meal').reduce((sum, e) => sum + (e.calories || 0), 0);
  const todayMeals = timeline.filter(e => e.type === 'meal').length;
  const waterTotal = timeline.filter(e => e.type === 'water').reduce((sum, e) => sum + (e.value || 0), 0);
  const lastWeight = timeline.filter(e => e.type === 'weight').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.value || 0;

  // Handlers
  const handleMoodSubmit = async (data: { energyLevel: number; emotion: EmotionTag }) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').insert({ user_id: user.id, entry_type: 'mood', hunger_level: data.energyLevel, mood_tag: data.emotion });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setRefetchTrigger(p => p + 1);
    toast({ title: '🧠 Check-in registrado' });
  };

  const handleWaterSubmit = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').insert({ user_id: user.id, entry_type: 'water', metric_value: amount });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setRefetchTrigger(p => p + 1);
    toast({ title: '💧 Água registrada', description: `+${amount}ml` });
  };

  const handleWeightSubmit = async (weight: number) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').insert({ user_id: user.id, entry_type: 'weight', metric_value: weight });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    await supabase.from('profiles').update({ weight }).eq('id', user.id);
    setRefetchTrigger(p => p + 1);
    toast({ title: '⚖️ Peso registrado', description: `${weight}kg` });
  };

  const handleMealSubmit = async (data: { method: 'ai' | 'manual'; description: string; calories?: number; imageUrl?: string; isEmotional?: boolean }) => {
    if (!user) return;
    const { error } = await supabase.from('meal_logs').insert({ user_id: user.id, entry_type: 'meal', food_name: data.description, calories: data.calories || 0, image_url: data.imageUrl || null, is_emotional: data.isEmotional || false, status: 'manual' });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setRefetchTrigger(p => p + 1);
    toast({ title: '🍎 Refeição registrada' });
  };

  const handleDeleteEntry = async () => {
    if (!user || !entryToDelete) return;
    const entryId = entryToDelete.id;
    setEntryToDelete(null);
    setTimeline(prev => prev.filter(e => e.id !== entryId));
    const { error } = await supabase.from('meal_logs').delete().eq('id', entryId);
    if (error) { setRefetchTrigger(p => p + 1); toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    toast({ title: '🗑️ Registro apagado' });
  };

  const handleDeleteAchievement = async () => {
    if (!user || !achievementToDelete || achievementToDelete === 'empty') return;
    const idToDelete = achievementToDelete;
    setAchievementToDelete(null);
    setAchievements(prev => prev.filter(a => a.id !== idToDelete));
    const { error } = await supabase.from('fasting_sessions').delete().eq('id', idToDelete);
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    toast({ title: '🗑️ Jejum removido' });
  };

  const handleEditMeal = (entry: TimelineEntry) => { setEditingMeal(entry); setMealEditDialogOpen(true); };

  const handleMealEditSubmit = async (data: { food_name: string; calories: number; is_emotional: boolean }) => {
    if (!user || !editingMeal) return;
    const { error } = await supabase.from('meal_logs').update(data).eq('id', editingMeal.id);
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setRefetchTrigger(p => p + 1);
    toast({ title: '✅ Atualizado' });
  };

  const weeks: DayActivity[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const stats = [
    { icon: Flame, label: 'Sequência', value: `${currentStreak}d` },
    { icon: Target, label: 'Semana', value: `${weeklyGoal.current}/${weeklyGoal.total}` },
    { icon: Trophy, label: 'Melhor', value: `${bestStreak}d` },
    { icon: TrendingUp, label: 'Sucesso', value: successRate },
  ];

  const sortedTimeline = [...timeline].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeB[0] * 60 + timeB[1]) - (timeA[0] * 60 + timeA[1]);
  });

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
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

          <main className="px-4 pt-4 space-y-4">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
              ) : (
                stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-2xl bg-card border border-border text-center"
                  >
                    <p className="text-[10px] text-muted-foreground mb-0.5">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <stat.icon className="h-4 w-4 mx-auto mt-1 text-[#84cc16]" />
                  </motion.div>
                ))
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="hoje" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-card p-1.5 rounded-full h-14 border border-border">
                <TabsTrigger value="hoje" className="rounded-full data-[state=active]:bg-[#84cc16] data-[state=active]:text-white data-[state=active]:shadow-md gap-2 h-full text-muted-foreground">
                  <ListTodo className="h-4 w-4" />
                  <span className="text-sm font-medium">Hoje</span>
                </TabsTrigger>
                <TabsTrigger value="progresso" className="rounded-full data-[state=active]:bg-[#84cc16] data-[state=active]:text-white data-[state=active]:shadow-md gap-2 h-full text-muted-foreground">
                  <ChartBar className="h-4 w-4" />
                  <span className="text-sm font-medium">90 dias</span>
                </TabsTrigger>
                <TabsTrigger value="conquistas" className="rounded-full data-[state=active]:bg-[#84cc16] data-[state=active]:text-white data-[state=active]:shadow-md gap-2 h-full text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Jejuns</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab: Hoje */}
              <TabsContent value="hoje" className="mt-4 space-y-4">
                {/* Today Summary */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Calorias</p>
                      <p className="text-2xl font-bold text-foreground tabular-nums">
                        {todayCalories.toLocaleString('pt-BR')}
                        <span className="text-sm font-medium text-foreground/60">/{(profile?.daily_calories_target || 2000).toLocaleString('pt-BR')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Refeições</p>
                      <p className="text-2xl font-bold text-[#84cc16] tabular-nums">{todayMeals}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Água</p>
                      <p className="text-2xl font-bold text-sky-400 tabular-nums">{waterTotal}<span className="text-sm">ml</span></p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((todayCalories / (profile?.daily_calories_target || 2000)) * 100, 100)}%` }}
                      className="h-full rounded-full bg-[#84cc16]"
                    />
                  </div>
                </motion.div>

                <QuickAssessmentBar
                  onMoodClick={() => setMoodDrawerOpen(true)}
                  onWaterClick={() => setWaterDialogOpen(true)}
                  onWeightClick={() => setWeightDialogOpen(true)}
                  onMealClick={() => setMealDialogOpen(true)}
                />

                {/* Timeline */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground">Linha do tempo</h3>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
                  ) : sortedTimeline.length > 0 ? (
                    sortedTimeline.map((entry, index) => (
                      <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                        <SwipeableRow onDelete={() => setEntryToDelete(entry)}>
                          <TimelineEntryCard entry={entry} onEdit={entry.type === 'meal' ? () => handleEditMeal(entry) : undefined} />
                        </SwipeableRow>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 rounded-xl bg-card border border-border">
                      <Coffee className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Nenhum registro hoje</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab: Progresso */}
              <TabsContent value="progresso" className="mt-4 space-y-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="h-4 w-4 text-[#84cc16]" />
                    <h3 className="text-sm font-semibold text-foreground">Atividade dos últimos 90 dias</h3>
                  </div>
                  
                  {loading ? (
                    <Skeleton className="h-28 rounded-xl" />
                  ) : (
                    <>
                      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
                        {weeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                              <motion.div
                                key={`${weekIndex}-${dayIndex}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + weekIndex * 0.01 }}
                                className={cn(
                                  "w-3.5 h-3.5 rounded-sm",
                                  day.intensity === 0 && "bg-muted",
                                  day.intensity === 1 && "bg-[#84cc16]/30",
                                  day.intensity === 2 && "bg-[#84cc16]/50",
                                  day.intensity === 3 && "bg-[#84cc16]/70",
                                  day.intensity === 4 && "bg-[#84cc16]"
                                )}
                                title={`${day.date.toLocaleDateString('pt-BR')} - ${day.count} atividades`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
                        <span>Menos</span>
                        <div className="flex gap-0.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-muted" />
                          <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]/30" />
                          <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]/50" />
                          <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]/70" />
                          <div className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]" />
                        </div>
                        <span>Mais</span>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* Stats detail */}
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-2xl bg-card border border-border text-center"
                    >
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <stat.icon className="h-5 w-5 mx-auto mt-2 text-[#84cc16]" />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Tab: Conquistas */}
              <TabsContent value="conquistas" className="mt-4 space-y-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="h-4 w-4 text-[#84cc16]" />
                    <h3 className="text-sm font-semibold text-foreground">Histórico de Jejuns</h3>
                  </div>
                  
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl mb-2" />)
                  ) : achievements.length > 0 ? (
                    <div className="space-y-2">
                      {achievements.map((achievement, index) => (
                        <motion.div key={achievement.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <SwipeableRow onDelete={() => setAchievementToDelete(achievement.id)}>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                              <span className="text-xl">{achievement.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">{achievement.title}</p>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              </div>
                            </div>
                          </SwipeableRow>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-foreground font-medium">Comece sua jornada</p>
                      <p className="text-xs text-muted-foreground">Complete jejuns para ver seu histórico</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      {/* Modals */}
      <MoodCheckInDrawer open={moodDrawerOpen} onOpenChange={setMoodDrawerOpen} onSubmit={handleMoodSubmit} />
      <WeightInputDialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen} onSubmit={handleWeightSubmit} lastWeight={lastWeight} />
      <WaterInputDialog open={waterDialogOpen} onOpenChange={setWaterDialogOpen} onSubmit={handleWaterSubmit} />
      <MealInputDialog open={mealDialogOpen} onOpenChange={setMealDialogOpen} onSubmit={handleMealSubmit} onPhotoSubmitted={() => setRefetchTrigger(p => p + 1)} />
      <MealEditDialog open={mealEditDialogOpen} onOpenChange={setMealEditDialogOpen} onSubmit={handleMealEditSubmit} initialData={{ food_name: editingMeal?.food_name || '', calories: editingMeal?.calories, is_emotional: editingMeal?.is_emotional }} />
      
      <DeleteConfirmationDrawer open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)} onConfirm={handleDeleteEntry} title="Deletar registro?" description="Este registro será removido permanentemente." />
      <DeleteConfirmationDrawer open={!!achievementToDelete} onOpenChange={(open) => !open && setAchievementToDelete(null)} onConfirm={handleDeleteAchievement} title="Deletar jejum?" description="Este registro de jejum será removido permanentemente." />

      <BottomNav />
    </div>
  );
}
