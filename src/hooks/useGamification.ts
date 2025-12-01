import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  current_level: number;
  current_cycle_xp: number;
  total_xp: number;
  current_streak: number;
  game_coins: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setStats({
          current_level: data.current_level || 1,
          current_cycle_xp: data.current_cycle_xp || 0,
          total_xp: data.total_xp || 0,
          current_streak: data.current_streak || 0,
          game_coins: data.game_coins || 0,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setStats({
          current_level: 1,
          current_cycle_xp: 0,
          total_xp: 0,
          current_streak: 0,
          game_coins: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel('user-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const data = payload.new as any;
            setStats({
              current_level: data.current_level || 1,
              current_cycle_xp: data.current_cycle_xp || 0,
              total_xp: data.total_xp || 0,
              current_streak: data.current_streak || 0,
              game_coins: data.game_coins || 0,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, loading };
};
