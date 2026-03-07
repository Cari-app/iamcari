import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
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

export function useFastingStats() {
  const { user } = useAuth();
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState({ completed: 0, target: 7 });
  const [historyList, setHistoryList] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFastingData = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      setLoading(true);
      const { data: sessions, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        toast({ title: 'Erro ao carregar dados', variant: 'destructive' });
        return;
      }

      if (!sessions) return;

      // Calculate streaks
      const completed = sessions.filter(s => s.status === 'completed');
      const uniqueDays = new Set<string>();
      completed.forEach(s => {
        const d = new Date(s.start_time);
        uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      });

      const sortedDays = Array.from(uniqueDays)
        .map(d => { const [y, m, day] = d.split('-').map(Number); return new Date(y, m, day); })
        .sort((a, b) => b.getTime() - a.getTime());

      // Current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < sortedDays.length; i++) {
        const expected = new Date(today);
        expected.setDate(today.getDate() - i);
        expected.setHours(0, 0, 0, 0);
        const day = new Date(sortedDays[i]);
        day.setHours(0, 0, 0, 0);
        if (day.getTime() === expected.getTime()) streak++;
        else break;
      }
      setCurrentStreak(streak);

      // Best streak
      let maxStreak = streak, tempStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const diff = Math.round((sortedDays[i - 1].getTime() - sortedDays[i].getTime()) / 86400000);
        if (diff === 1) { tempStreak++; maxStreak = Math.max(maxStreak, tempStreak); }
        else tempStreak = 1;
      }
      setBestStreak(Math.max(maxStreak, streak));

      // Weekly goal
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const weeklyCompleted = sessions.filter(
        s => s.status === 'completed' && new Date(s.start_time) >= sevenDaysAgo
      ).length;
      setWeeklyGoal({ completed: weeklyCompleted, target: 7 });

      // History
      const history = sessions
        .filter(s => (s.status === 'completed' || s.status === 'paused') && s.end_time)
        .slice(0, 10)
        .map(s => {
          const start = new Date(s.start_time);
          const end = new Date(s.end_time!);
          const elapsedMins = Math.floor((end.getTime() - start.getTime()) / 60000);
          const targetMins = (s.target_hours || 16) * 60;
          return {
            id: s.id,
            start_time: s.start_time,
            end_time: s.end_time!,
            target_hours: s.target_hours || 16,
            elapsed_minutes: elapsedMins,
            progress: Math.round((elapsedMins / targetMins) * 100),
            status: s.status as 'completed' | 'paused',
          };
        });
      setHistoryList(history);
    } catch (error) {
      console.error('Error fetching fasting data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch + realtime subscription
  useEffect(() => {
    fetchFastingData();
    if (!user) return;

    const channel = supabase
      .channel('fasting-stats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fasting_sessions',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchFastingData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchFastingData]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    setHistoryList(prev => prev.filter(s => s.id !== sessionId));

    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      fetchFastingData();
      toast({ title: 'Erro', description: 'Não foi possível deletar o jejum.', variant: 'destructive' });
    } else {
      toast({ title: 'Jejum deletado', description: 'O registro foi removido.' });
    }
  }, [user, fetchFastingData]);

  return {
    bestStreak,
    currentStreak,
    weeklyGoal,
    historyList,
    loading,
    deleteSession,
    refresh: fetchFastingData,
  };
}
