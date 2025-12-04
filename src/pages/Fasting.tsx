import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { CircularProgress } from '@/components/CircularProgress';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, RotateCcw, Flame, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoImage from '@/assets/logo-cari.png';

export default function Fasting() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  const [weeklyFasts, setWeeklyFasts] = useState(0);
  const [totalFastingHours, setTotalFastingHours] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (profile?.fasting_protocol) {
      const hours = parseInt(profile.fasting_protocol.replace('h', ''));
      setSelectedProtocol(hours);
    }
  }, [profile]);
  
  const {
    elapsedSeconds,
    progress,
    isActive,
    currentPhase,
    phaseInfo,
    startFasting,
    stopFasting,
    formatTime,
    targetHours,
  } = useFastingTimer();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const fetchFastingData = async () => {
      try {
        setLoading(true);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data: weeklyData, error } = await supabase
          .from('fasting_sessions')
          .select('id, start_time, end_time')
          .eq('user_id', user.id)
          .not('end_time', 'is', null)
          .gte('start_time', sevenDaysAgo);
        
        if (error) {
          console.error('Error fetching weekly data:', error);
        }
        
        setWeeklyFasts(weeklyData?.length || 0);
        
        if (weeklyData) {
          const totalHours = weeklyData.reduce((acc, session) => {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time!);
            return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }, 0);
          setTotalFastingHours(Math.floor(totalHours));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFastingData();
  }, [user]);

  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ fasting_protocol: `${hours}h` })
      .eq('id', user.id);
    
    if (!error) {
      refreshProfile?.();
    }
  };

  const time = formatTime(elapsedSeconds);

  const phaseIcons = {
    'fed': Flame,
    'fasting': Zap,
    'ketosis': Flame,
    'autophagy': Sparkles,
    'deep-autophagy': Sparkles,
  };

  const PhaseIcon = phaseIcons[currentPhase];

  return (
    <div className="min-h-[100dvh] bg-background pb-24">
      <div className="mx-auto max-w-lg">
        {/* Green Gradient Header */}
        <div className="bg-gradient-to-b from-primary via-primary/90 to-primary/80 pt-safe-top pb-8 rounded-b-3xl">
          <div className="flex items-center justify-between px-4 pt-4 pb-4">
            <img src={logoImage} alt="Cari" className="h-8" />
            <Link to="/profile">
              <Avatar className="h-10 w-10 border-2 border-white/30">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          <div className="text-center px-4">
            <h2 className="text-xl text-white/90 font-medium">
              {isActive ? 'Jejum em andamento' : 'Pronto para começar?'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="px-4 -mt-4 space-y-6">
          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center py-4"
          >
            <CircularProgress progress={isActive ? progress : 0} size={280} strokeWidth={20}>
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tabular-nums text-foreground">
                    {time.hours}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground">:</span>
                  <span className="text-5xl font-extrabold tabular-nums text-foreground">
                    {time.minutes}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground">:</span>
                  <span className="text-3xl font-bold tabular-nums text-muted-foreground">
                    {time.seconds}
                  </span>
                </div>
                
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                      "bg-card border border-border"
                    )}>
                      <PhaseIcon className={cn("h-4 w-4", phaseInfo.color)} />
                      <span className={cn("text-sm font-medium", phaseInfo.color)}>
                        {phaseInfo.label}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3"
                  >
                    <ProtocolSelector
                      selectedHours={selectedProtocol}
                      onSelect={handleProtocolSelect}
                      isOpen={isProtocolOpen}
                      onOpenChange={setIsProtocolOpen}
                    />
                  </motion.div>
                )}
              </div>
            </CircularProgress>
          </motion.div>

          {/* Phase Info Card */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <p className="text-center text-muted-foreground">
                {phaseInfo.description}
              </p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary tabular-nums">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Progresso</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary tabular-nums">
                    {targetHours}h
                  </p>
                  <p className="text-xs text-muted-foreground">Meta</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            {!isActive ? (
              <Button
                onClick={() => startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard')}
                className="flex-1 h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-green"
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopFasting}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-semibold text-base press-effect border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Encerrar
                </Button>
                <Button
                  onClick={() => {
                    stopFasting();
                    setTimeout(() => startFasting(selectedProtocol, isCustomProtocol ? 'custom' : 'standard'), 100);
                  }}
                  variant="outline"
                  className="h-14 w-14 rounded-2xl press-effect"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {loading ? (
              <>
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {weeklyFasts}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jejuns esta semana
                  </p>
                </div>
                
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {totalFastingHours}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Horas de jejum
                  </p>
                </div>
              </>
            )}
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 text-center text-muted-foreground font-medium"
            >
              Dieta
            </button>
            <button className="flex-1 py-3 text-center text-muted-foreground font-medium relative">
              Jejum
              <motion.div 
                layoutId="fasting-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
              />
            </button>
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
