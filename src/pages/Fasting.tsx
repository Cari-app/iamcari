import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { CircularProgress } from '@/components/CircularProgress';
import { ProtocolSelector } from '@/components/dashboard/ProtocolSelector';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { useFastingStats } from '@/hooks/useFastingStats';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Clock, Flame, Target, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedDate } from '@/contexts/DateContext';
import { AppHeader } from '@/components/AppHeader';
import { toast } from '@/hooks/use-toast';

export default function Fasting() {
  const { user, profile, refreshProfile } = useAuth();
  const { selectedDate, setSelectedDate } = useSelectedDate();

  const [selectedProtocol, setSelectedProtocol] = useState(16);
  const [isCustomProtocol, setIsCustomProtocol] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Hooks
  const {
    elapsedSeconds, progress, isActive,
    startFasting, stopFasting, formatTime,
    targetHours, loading: timerLoading,
  } = useFastingTimer();

  const {
    bestStreak, currentStreak, weeklyGoal,
    historyList, loading: statsLoading, deleteSession,
  } = useFastingStats();

  // Load protocol from profile
  useEffect(() => {
    if (profile?.fasting_protocol) {
      const hours = parseFloat(profile.fasting_protocol.replace(/[^0-9.]/g, ''));
      if (!isNaN(hours) && hours > 0 && hours <= 48) setSelectedProtocol(hours);
    }
  }, [profile]);

  const handleProtocolSelect = async (hours: number, isCustom: boolean = false) => {
    setSelectedProtocol(hours);
    setIsCustomProtocol(isCustom);
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ fasting_protocol: `${hours}h` })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar o protocolo.', variant: 'destructive' });
    } else {
      refreshProfile?.();
    }
  };

  const handleStartFasting = async () => {
    await startFasting(selectedProtocol);
    toast({ title: 'Jejum iniciado!', description: `Meta de ${selectedProtocol} horas de jejum.` });
  };

  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  const time = formatTime(elapsedSeconds);
  const isLoading = statsLoading || timerLoading;

  const formatPausedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h${mins}min`;
  };

  return (
    <div className="min-h-[100dvh] bg-background relative">
      {/* Gradient header */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-lg relative">
        <div className="relative z-10">
          <AppHeader />

          <div className="mt-4">
            <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>

          {/* Status Text */}
          <div className="text-center px-4 mt-4">
            <h2 className="text-2xl text-white font-semibold">
              {isActive ? 'Jejum em andamento' : 'Pronto pra começar'}
            </h2>
            <p className="mt-1 text-lime-800 dark:text-lime-500 font-bold">
              {isActive ? `Meta: ${targetHours}h de jejum` : 'Inicie seu jejum quando estiver pronto'}
            </p>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center py-6 px-4">
            <CircularProgress progress={isActive ? progress : 0} size={260} strokeWidth={14}>
              <div className="flex items-baseline justify-center">
                <span className="text-6xl font-black tabular-nums text-green-700">{time.hours}</span>
                <span className="text-4xl font-bold mx-1 text-green-700">:</span>
                <span className="text-6xl font-black tabular-nums text-green-700">{time.minutes}</span>
                <span className="text-2xl font-semibold tabular-nums ml-1 text-green-700">:{time.seconds}</span>
              </div>
            </CircularProgress>

            <div className="mt-5">
              {isActive ? (
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-green-500/60 backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Meta: {targetHours}h</span>
                </div>
              ) : (
                <ProtocolSelector
                  selectedHours={selectedProtocol}
                  onSelect={handleProtocolSelect}
                  isOpen={isProtocolOpen}
                  onOpenChange={setIsProtocolOpen}
                />
              )}
            </div>
          </div>

          <main className="px-4 space-y-4 pb-[20px] mb-[20px]">
            {/* Action Button */}
            {!isActive ? (
              <Button onClick={handleStartFasting} className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg bg-green-700 hover:bg-green-600">
                <Play className="mr-2 h-5 w-5" />
                Iniciar Jejum {selectedProtocol}h
              </Button>
            ) : (
              <Button onClick={stopFasting} variant="outline" className="w-full h-14 rounded-2xl font-semibold text-base border-red-400/50 text-red-400 hover:bg-red-400/10">
                <Pause className="mr-2 h-5 w-5" />
                Encerrar Jejum
              </Button>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {isLoading ? (
                <>
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                </>
              ) : (
                <>
                  <StatCard label="Melhor sequência" value={bestStreak} icon={Flame} gradientFrom="orange-400" gradientTo="red-500" iconColor="text-orange-500" barColor="from-orange-400 via-orange-300 to-orange-400" />
                  <StatCard label="Sequência atual" value={currentStreak} icon={Trophy} gradientFrom="yellow-400" gradientTo="amber-500" iconColor="text-yellow-500" barColor="from-yellow-400 via-yellow-300 to-yellow-400" />
                  <StatCard
                    label="Meta Semanal"
                    value={weeklyGoal.completed}
                    suffix={`/${weeklyGoal.target}`}
                    icon={Target}
                    gradientFrom="lime-400"
                    gradientTo="green-500"
                    iconColor="text-lime-500"
                    barColor="from-lime-400 via-lime-300 to-lime-400"
                  />
                </>
              )}
            </div>

            {/* History */}
            {historyList.length > 0 && !isActive && (
              <div className="space-y-3">
                {historyList.map(session => (
                  <SwipeableRow key={session.id} onDelete={() => setSessionToDelete(session.id)}>
                    <div className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${session.status === 'completed' ? 'bg-lime-500/20' : 'bg-orange-500/20'}`}>
                          <Pause className={`h-5 w-5 ${session.status === 'completed' ? 'text-lime-500' : 'text-orange-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Início {new Date(session.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="font-semibold text-foreground truncate">
                            Jejum de {formatPausedTime(session.elapsed_minutes)} {session.status === 'completed' ? 'completo' : 'pausado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.end_time).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-medium ${session.progress >= 100 ? 'text-lime-500' : 'text-orange-500'}`}>
                            {session.progress}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwipeableRow>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <BottomNav />

      <DeleteConfirmationDrawer
        open={!!sessionToDelete}
        onOpenChange={open => !open && setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Deletar jejum?"
        description="Você perderá o registro deste jejum. Esta ação não pode ser desfeita."
      />
    </div>
  );
}

// Small reusable stat card component
function StatCard({
  label, value, suffix, icon: Icon, gradientFrom, gradientTo, iconColor, barColor,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradientFrom: string;
  gradientTo: string;
  iconColor: string;
  barColor: string;
}) {
  return (
    <div className="relative p-4 rounded-2xl bg-white dark:bg-card text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)]">
      <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r ${barColor}`} />
      <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mt-2 mb-2">{label}</p>
      <p className="text-3xl font-black text-foreground tabular-nums">
        {value}
        {suffix && <span className="text-lg font-bold text-lime-500">{suffix}</span>}
      </p>
      <div className="mt-3 flex justify-center">
        <div className={`p-2 rounded-xl bg-gradient-to-br from-${gradientFrom}/20 to-${gradientTo}/20`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
