import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  ACHIEVEMENTS,
  AchievementData,
  AchievementTier,
  UnlockedAchievement,
  calculateUnlocks,
  getTierLabel,
} from '@/lib/achievements';

export function useAchievements() {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndEvaluate = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Fetch all data in parallel
      const [fastingRes, waterRes, weightRes, unlockedRes] = await Promise.all([
        supabase.from('fasting_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('water_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: true }),
        supabase.from('weight_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: true }),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
      ]);

      const sessions = fastingRes.data || [];
      const waterLogs = waterRes.data || [];
      const weightLogs = weightRes.data || [];
      const existing = (unlockedRes.data || []) as unknown as UnlockedAchievement[];

      // Calculate fasting data
      const completedSessions = sessions.filter(s => s.end_time);
      const totalFasts = completedSessions.length;

      let longestFastHours = 0;
      let totalFastingHours = 0;
      completedSessions.forEach(s => {
        const hours = (new Date(s.end_time!).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60);
        totalFastingHours += hours;
        if (hours > longestFastHours) longestFastHours = hours;
      });

      // Fasting streak (consecutive days with completed fasts)
      const fastingStreak = calculateStreak(completedSessions.map(s => s.created_at));

      // Water streak
      const waterStreak = calculateStreak(waterLogs.map(w => w.logged_at));

      // Weight data
      const weightStreak = calculateStreak(weightLogs.map(w => w.logged_at));
      let weightLostKg = 0;
      if (weightLogs.length >= 2) {
        const first = weightLogs[0].weight;
        const last = weightLogs[weightLogs.length - 1].weight;
        weightLostKg = Math.max(0, first - last);
      }

      const data: AchievementData = {
        totalFasts,
        fastingStreak,
        longestFastHours: Math.floor(longestFastHours),
        totalFastingHours: Math.floor(totalFastingHours),
        totalWaterLogs: waterLogs.length,
        waterStreak,
        totalWeightLogs: weightLogs.length,
        weightStreak,
        weightLostKg,
      };

      setAchievementData(data);

      // Calculate what should be unlocked
      const shouldBeUnlocked = calculateUnlocks(data);

      // Find new unlocks
      const existingKeys = new Set(existing.map(e => `${e.key}:${e.tier}`));
      const newUnlocks = shouldBeUnlocked.filter(u => !existingKeys.has(`${u.key}:${u.tier}`));

      // Insert new achievements
      if (newUnlocks.length > 0) {
        const inserts = newUnlocks.map(u => ({
          user_id: user.id,
          achievement_key: u.key,
          tier: u.tier,
        }));

        const { data: inserted } = await supabase.from('user_achievements').insert(inserts).select();

        if (inserted) {
          // Show toast for new unlocks
          newUnlocks.forEach(u => {
            const def = ACHIEVEMENTS.find(a => a.key === u.key);
            if (def) {
              const emoji = u.tier === 'gold' ? '🥇' : u.tier === 'silver' ? '🥈' : '🥉';
              toast({
                title: `${emoji} Nova Conquista!`,
                description: `${def.title} — ${getTierLabel(u.tier)}`,
              });
            }
          });
        }
      }

      // Set all unlocked
      const allUnlocked = [...existing, ...newUnlocks.map(u => ({
        key: u.key,
        tier: u.tier as AchievementTier,
        unlocked_at: new Date().toISOString(),
      }))];

      setUnlockedAchievements(allUnlocked);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAndEvaluate();
  }, [fetchAndEvaluate]);

  return { unlockedAchievements, achievementData, loading, refresh: fetchAndEvaluate };
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = new Set(dates.map(d => new Date(d).toDateString()));
  const sortedDays = Array.from(uniqueDays).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    expected.setHours(0, 0, 0, 0);

    const day = sortedDays[i];
    day.setHours(0, 0, 0, 0);

    if (day.getTime() === expected.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
