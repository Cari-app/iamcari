import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAchievementNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for new achievements
    const channel = supabase
      .channel('achievement-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Check if notifications are enabled
          const notificationsEnabled = localStorage.getItem('notifications_enabled') !== 'false';
          if (!notificationsEnabled) return;

          // Fetch achievement details
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('code', payload.new.achievement_code)
            .single();

          if (achievement) {
            // Show celebratory toast
            toast({
              title: `🎉 Conquista Desbloqueada: ${achievement.icon} ${achievement.name}`,
              description: `${achievement.description} (+${achievement.xp_reward} XP)`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};
