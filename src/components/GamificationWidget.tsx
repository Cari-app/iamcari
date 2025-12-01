import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

export function GamificationWidget() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, loading } = useGamification();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="hidden sm:flex flex-col gap-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-1.5 w-20" />
        </div>
      </div>
    );
  }

  const level = stats?.current_level || 1;
  const xp = stats?.current_cycle_xp || 0;
  const xpPercentage = (xp / 1000) * 100;

  return (
    <motion.button
      onClick={() => navigate('/profile')}
      className="flex items-center justify-end gap-2 press-effect rounded-xl hover:bg-accent/5 p-1.5 transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="hidden sm:flex items-center gap-1.5">
        <Progress 
          value={xpPercentage} 
          className="h-2 w-20 bg-secondary"
        />
        <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
          {xp}/1000 XP
        </span>
      </div>

      <div className="relative">
        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
          <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
          <AvatarFallback className="bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-violet-400/30">
          Lvl {level}
        </div>
      </div>
    </motion.button>
  );
}
