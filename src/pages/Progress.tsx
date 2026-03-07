import React, { useState, useEffect, useMemo } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { WeightInputDialog } from '@/components/diary/WeightInputDialog';
import { WaterInputDialog } from '@/components/diary/WaterInputDialog';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Target, Trophy, TrendingUp, CalendarDays, Droplet, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedDate } from '@/contexts/DateContext';
import { toast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/AppHeader';
import { QuickAssessmentBar } from '@/components/diary/QuickAssessmentBar';
import { AchievementsTab } from '@/components/progress/AchievementsTab';
import { useAchievements } from '@/hooks/useAchievements';

interface DayActivity {
  date: Date;
  count: number;
  intensity: number;
}

interface HistoryEntry {
  id: string;
  type: 'weight' | 'water';
  value: number;
  time: string;
  logged_at: string;
}

const PERIOD_OPTIONS = [
  { value: 7, label: '7d' },
  { value: 15, label: '15d' },
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
] as const;

const WEEKDAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export default function Progress() {
  const { user, profile } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  const [loading, setLoading] = useState(true);
  const [heatmapPeriod, setHeatmapPeriod] = useState<number>(30);

  // Progress stats
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 0, total: 7 });
  const [bestStreak, setBestStreak] = useState(0);
  const [successRate, setSuccessRate] = useState('--');
  const [totalFastsCount, setTotalFastsCount] = useState(0);
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [achievements, setAchievements] = useState<Array<{
    id: string;
    iconType: 'completed' | 'paused';
    title: string;
    description: string;
  }>>([]);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  // Diary states
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // History
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  // Fetch progress data (always 90 days, filter in UI)
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

        // Current streak
        let streak = 0;
        let checkDate = new Date(selectedDate);
        checkDate.setHours(0, 0, 0, 0);
        while (activeDays.has(checkDate.toDateString())) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
        setCurrentStreak(streak);

        // Best streak
        const sortedDates = Array.from(activeDays.keys()).sort();
        let maxStreak = 0, tempStreak = 0;
        let lastDate: Date | null = null;
        sortedDates.forEach(dateStr => {
          const currentDate = new Date(dateStr);
          if (lastDate) {
            const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
          lastDate = currentDate;
        });
        maxStreak = Math.max(maxStreak, tempStreak);
        setBestStreak(maxStreak);

        // Weekly goal
        const startOfWeek = new Date(selectedDate);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
        startOfWeek.setHours(0, 0, 0, 0);
        let weeklyCount = 0;
        for (let i = 0; i < 7; i++) {
          const cd = new Date(startOfWeek);
          cd.setDate(cd.getDate() + i);
          if (activeDays.has(cd.toDateString())) weeklyCount++;
        }
        setWeeklyGoal({ current: weeklyCount, total: 7 });

        // Success rate
        const completedFasts = fastingSessions?.filter(s => s.end_time !== null).length || 0;
        const totalFasts = fastingSessions?.length || 0;
        setTotalFastsCount(totalFasts);
        setSuccessRate(totalFasts > 0 ? `${Math.round(completedFasts / totalFasts * 100)}%` : '--');

        // Generate full 91-day heatmap
        const heatmap: DayActivity[] = [];
        for (let i = 0; i < 91; i++) {
          const date = new Date(referenceDate);
          date.setDate(date.getDate() - (90 - i));
          date.setHours(0, 0, 0, 0);
          const count = activeDays.get(date.toDateString()) || 0;
          const intensity = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count >= 3 ? 3 : 4;
          heatmap.push({ date, count, intensity });
        }
        setHeatmapData(heatmap);

        // Achievements
        const finishedFasts = fastingSessions?.filter(s => s.end_time !== null) || [];
        const achievementsList = finishedFasts.slice(-5).reverse().map(fast => {
          const start = new Date(fast.start_time);
          const end = new Date(fast.end_time!);
          const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const wasCompleted = fast.status === 'completed' || hours >= (fast.target_hours || 16);
          const timeText = hours > 0 && minutes > 0 ? `${hours}h${minutes}min` : hours > 0 ? `${hours}h` : `${minutes}min`;
          return {
            id: fast.id,
            iconType: (wasCompleted ? 'completed' : 'paused') as 'completed' | 'paused',
            title: wasCompleted ? `Jejum de ${timeText} concluído` : `Jejum de ${timeText} pausado`,
            description: new Date(fast.end_time!).toLocaleDateString('pt-BR')
          };
        });
        setAchievements(achievementsList);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [user, selectedDate, refetchTrigger]);

  // Fetch history entries for selected date
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const [weightRes, waterRes] = await Promise.all([
        supabase.from('weight_logs').select('*').eq('user_id', user.id)
          .gte('logged_at', dayStart.toISOString()).lte('logged_at', dayEnd.toISOString())
          .order('logged_at', { ascending: false }),
        supabase.from('water_logs').select('*').eq('user_id', user.id)
          .gte('logged_at', dayStart.toISOString()).lte('logged_at', dayEnd.toISOString())
          .order('logged_at', { ascending: false }),
      ]);

      const entries: HistoryEntry[] = [];

      weightRes.data?.forEach(w => {
        entries.push({
          id: w.id,
          type: 'weight',
          value: w.weight,
          time: new Date(w.logged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          logged_at: w.logged_at,
        });
      });

      waterRes.data?.forEach(w => {
        entries.push({
          id: w.id,
          type: 'water',
          value: w.amount_ml,
          time: new Date(w.logged_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          logged_at: w.logged_at,
        });
      });

      entries.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
      setHistoryEntries(entries);
    };
    fetchHistory();
  }, [user, selectedDate, refetchTrigger]);

  // Filter heatmap by period
  const filteredHeatmap = useMemo(() => {
    return heatmapData.slice(-heatmapPeriod);
  }, [heatmapData, heatmapPeriod]);

  // Build grid: columns = weeks, rows = days of week
  const heatmapGrid = useMemo(() => {
    if (filteredHeatmap.length === 0) return [];

    const firstDay = filteredHeatmap[0].date.getDay();
    const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
    const padded: (DayActivity | null)[] = Array(mondayOffset).fill(null).concat(filteredHeatmap);

    const weeks: (DayActivity | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) lastWeek.push(null);

    return weeks;
  }, [filteredHeatmap]);

  // Keep heatmap visually stretched to the full card width in every period
  const stretchedHeatmapGrid = useMemo(() => {
    const minColumns = 14;
    if (heatmapGrid.length >= minColumns) return heatmapGrid;

    const fillerWeek: (DayActivity | null)[] = Array(7).fill(null);
    const missingColumns = minColumns - heatmapGrid.length;

    return [...Array(missingColumns).fill(null).map(() => [...fillerWeek]), ...heatmapGrid];
  }, [heatmapGrid]);

  // Period stats
  const periodStats = useMemo(() => {
    const activeDaysCount = filteredHeatmap.filter(d => d.count > 0).length;
    const totalDays = filteredHeatmap.length;
    const percentage = totalDays > 0 ? Math.round((activeDaysCount / totalDays) * 100) : 0;
    return { activeDaysCount, totalDays, percentage };
  }, [filteredHeatmap]);

  // Handlers
  const handleWaterSubmit = async (amount: number) => {
    if (!user) return;
    const { error } = await supabase.from('water_logs').insert({
      user_id: user.id, amount_ml: amount
    });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setRefetchTrigger(p => p + 1);
    toast({ title: '💧 Água registrada', description: `+${amount}ml` });
  };

  const handleWeightSubmit = async (weight: number) => {
    if (!user) return;
    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id, weight
    });
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
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
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    toast({ title: '🗑️ Jejum removido' });
  };

  const handleDeleteHistoryEntry = async (entry: HistoryEntry) => {
    const table = entry.type === 'weight' ? 'weight_logs' : 'water_logs';
    const { error } = await supabase.from(table).delete().eq('id', entry.id);
    if (error) { toast({ title: '❌ Erro', variant: 'destructive' }); return; }
    setHistoryEntries(prev => prev.filter(e => e.id !== entry.id));
    toast({ title: '🗑️ Registro removido' });
  };

  const stats = [
    { icon: Flame, label: 'Sequência', value: `${currentStreak}d` },
    { icon: Target, label: 'Meta Semanal', value: `${weeklyGoal.current}/${weeklyGoal.total}` },
    { icon: Trophy, label: 'Melhor', value: `${bestStreak}d` },
    { icon: TrendingUp, label: 'Taxa', value: successRate },
  ];

  return (
    <div className="min-h-[100dvh] bg-background relative pb-24">
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
                Atividade
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-1.5">
                <Trophy className="h-4 w-4" />
                Conquistas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="mt-4 space-y-4">
              {/* Quick assessment bar */}
              <QuickAssessmentBar
                onWeightClick={() => setWeightDialogOpen(true)}
                onWaterClick={() => setWaterDialogOpen(true)}
              />

              {/* Heatmap Card */}
              <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] overflow-hidden">
                {/* Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground text-base">Atividade de Jejum</h3>
                    <span className="text-xs font-semibold text-lime-600 dark:text-lime-400">
                      {periodStats.activeDaysCount} dias ativos
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {periodStats.percentage}% de consistência nos últimos {heatmapPeriod} dias
                  </p>
                </div>

                {/* Period Filter */}
                <div className="px-4 pt-3 pb-2">
                  <div className="flex gap-1.5 p-1 rounded-xl bg-muted/50">
                    {PERIOD_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setHeatmapPeriod(opt.value)}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-200',
                          heatmapPeriod === opt.value
                            ? 'bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-md shadow-lime-500/30'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Heatmap Grid */}
                <div className="px-4 pb-4 pt-2">
                  <div className="flex gap-1.5">
                    {/* Weekday labels */}
                    <div className="flex flex-col justify-between gap-[3px] pr-0.5 shrink-0">
                      {WEEKDAY_LABELS.map((label, i) => (
                        <div key={i} className="h-[14px] w-3 flex items-center justify-center">
                          <span className="text-[9px] font-medium text-muted-foreground leading-none">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Grid columns */}
                    <div className="flex-1">
                      <div className="grid w-full gap-[3px]" style={{ gridTemplateColumns: `repeat(${stretchedHeatmapGrid.length}, minmax(0, 1fr))` }}>
                        {stretchedHeatmapGrid.map((week, weekIdx) => (
                          <div key={weekIdx} className="flex flex-col gap-[3px]">
                            {week.map((day, dayIdx) => (
                              <div
                                key={dayIdx}
                                className={cn(
                                  'w-full aspect-square rounded-[3px] transition-colors duration-200',
                                  !day && 'bg-muted/40 dark:bg-muted/30',
                                  day && day.intensity === 0 && 'bg-muted/80 dark:bg-muted/40',
                                  day && day.intensity === 1 && 'bg-lime-400/40 dark:bg-lime-500/30',
                                  day && day.intensity === 2 && 'bg-lime-400/65 dark:bg-lime-500/55',
                                  day && day.intensity === 3 && 'bg-lime-500/85 dark:bg-lime-500/75',
                                  day && day.intensity >= 4 && 'bg-lime-500 dark:bg-lime-400'
                                )}
                                title={day ? `${day.date.toLocaleDateString('pt-BR')}: ${day.count} jejum(s)` : ''}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>Menos</span>
                      <div className="flex gap-0.5">
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/80 dark:bg-muted/40" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-lime-400/40 dark:bg-lime-500/30" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-lime-400/65 dark:bg-lime-500/55" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-lime-500/85 dark:bg-lime-500/75" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-lime-500 dark:bg-lime-400" />
                      </div>
                      <span>Mais</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {totalFastsCount} jejuns total
                    </span>
                  </div>
                </div>
              </div>

              {/* History Timeline */}
              {historyEntries.length > 0 && (
                <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(132,204,22,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.12)] overflow-hidden">
                  <div className="p-4 pb-2">
                    <h3 className="font-bold text-foreground text-base">Registros do dia</h3>
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    {historyEntries.map(entry => (
                      <SwipeableRow key={entry.id} onDelete={() => handleDeleteHistoryEntry(entry)}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40">
                          <div className={cn(
                            'p-2 rounded-lg shrink-0',
                            entry.type === 'weight' ? 'bg-lime-500/15' : 'bg-sky-500/15'
                          )}>
                            {entry.type === 'weight'
                              ? <Scale className="h-4 w-4 text-lime-500" />
                              : <Droplet className="h-4 w-4 text-sky-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {entry.type === 'weight' ? `${entry.value}kg` : `${entry.value}ml`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.type === 'weight' ? 'Peso' : 'Água'} · {entry.time}
                            </p>
                          </div>
                        </div>
                      </SwipeableRow>
                    ))}
                  </div>
                </div>
              )}
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

      <WeightInputDialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen} onSubmit={handleWeightSubmit} lastWeight={profile?.weight || 70} />
      <WaterInputDialog open={waterDialogOpen} onOpenChange={setWaterDialogOpen} onSubmit={handleWaterSubmit} />
      <DeleteConfirmationDrawer open={!!achievementToDelete} onOpenChange={open => !open && setAchievementToDelete(null)} onConfirm={handleDeleteAchievement} title="Deletar conquista?" description="Esta ação removerá o registro do jejum." />
    </div>
  );
}
