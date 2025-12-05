import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { CalorieHeader } from '@/components/dashboard/CalorieHeader';
import { MacroCards } from '@/components/dashboard/MacroCards';
import { MealCard } from '@/components/dashboard/MealCard';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { DeleteConfirmationDrawer } from '@/components/DeleteConfirmationDrawer';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pause, Clock } from 'lucide-react';
import logoImage from '@/assets/logo-cari.png';

const MACRO_TARGETS = {
  protein: 150,
  carbs: 250,
  fat: 70
};

interface FastingSession {
  id: string;
  start_time: string;
  end_time: string | null;
  target_hours: number;
  status: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<'dieta' | 'jejum'>('dieta');
  const [meals, setMeals] = useState<TimelineEntry[]>([]);
  const [fastingSessions, setFastingSessions] = useState<FastingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<TimelineEntry | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const caloriesTarget = profile?.daily_calories_target || 2000;

  // Memoized calculations for meals
  const totalCalories = useMemo(() => meals.reduce((sum, m) => sum + (m.calories || 0), 0), [meals]);
  const totalMacros = useMemo(() => meals.reduce((acc, meal) => {
    const analysis = meal.ai_analysis && typeof meal.ai_analysis === 'object' && !Array.isArray(meal.ai_analysis) ? meal.ai_analysis as unknown as Record<string, number> : null;
    const macros = meal.macros && typeof meal.macros === 'object' && !Array.isArray(meal.macros) ? meal.macros : null;
    
    const protein = Number(macros?.protein) || Number(analysis?.protein) || 0;
    const carbs = Number(macros?.carbs) || Number(analysis?.carbs) || 0;
    const fat = Number(macros?.fat) || Number(analysis?.fat) || 0;
    
    return {
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat
    };
  }, { protein: 0, carbs: 0, fat: 0 }), [meals]);

  const macroProps = useMemo(() => ({
    protein: {
      value: totalMacros.protein,
      percentage: Math.round(totalMacros.protein / MACRO_TARGETS.protein * 100)
    },
    carbs: {
      value: totalMacros.carbs,
      percentage: Math.round(totalMacros.carbs / MACRO_TARGETS.carbs * 100)
    },
    fat: {
      value: totalMacros.fat,
      percentage: Math.round(totalMacros.fat / MACRO_TARGETS.fat * 100)
    }
  }), [totalMacros]);

  // Fetch meals
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('entry_type', 'meal')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) {
          toast({
            title: '❌ Erro ao carregar',
            description: 'Não foi possível carregar as refeições.',
            variant: 'destructive'
          });
          return;
        }
        if (data) {
          setMeals(data.map(log => ({
            id: log.id,
            type: 'meal' as const,
            time: new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            created_at: log.created_at,
            entry_method: log.image_url ? 'ai' as const : 'manual' as const,
            food_name: log.food_name || '',
            description: log.description || '',
            calories: log.calories || 0,
            image_url: log.image_url,
            is_emotional: log.is_emotional || false,
            hunger_level: log.hunger_level,
            ai_analysis: log.ai_analysis as any,
            macros: log.macros as { protein?: number; carbs?: number; fat?: number } | undefined,
            status: log.status || 'manual'
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
    const channel = supabase.channel('dashboard-meals').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'meal_logs',
      filter: `user_id=eq.${user.id}`
    }, fetchMeals).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate]);

  // Fetch fasting sessions
  useEffect(() => {
    if (!user) return;
    
    const fetchFastingData = async () => {
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch sessions that started OR ended on selected date
        const { data: daySessions } = await supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .or(`and(start_time.gte.${startOfDay.toISOString()},start_time.lte.${endOfDay.toISOString()}),and(end_time.gte.${startOfDay.toISOString()},end_time.lte.${endOfDay.toISOString()})`)
          .order('start_time', { ascending: false });

        if (daySessions) {
          setFastingSessions(daySessions);
        }
      } catch (error) {
        console.error('Error fetching fasting data:', error);
      }
    };

    fetchFastingData();
    
    const channel = supabase.channel('dashboard-fasting').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'fasting_sessions',
      filter: `user_id=eq.${user.id}`
    }, fetchFastingData).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate]);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  
  const handleDeleteMeal = async () => {
    if (!user || !mealToDelete) return;
    const mealId = mealToDelete.id;
    setMealToDelete(null);
    setMeals(prev => prev.filter(m => m.id !== mealId));
    
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', user.id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível deletar a refeição.', variant: 'destructive' });
    } else {
      toast({ title: 'Refeição deletada', description: 'O registro e macros foram removidos.' });
    }
  };

  const handleDeleteSession = async () => {
    if (!user || !sessionToDelete) return;
    const sessionId = sessionToDelete;
    setSessionToDelete(null);
    setFastingSessions(prev => prev.filter(s => s.id !== sessionId));
    
    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);
    
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível deletar o jejum.', variant: 'destructive' });
    } else {
      toast({ title: 'Jejum deletado', description: 'O registro foi removido.' });
    }
  };

  const formatPausedTime = (session: FastingSession) => {
    if (!session.end_time) return '';
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const elapsedMs = end.getTime() - start.getTime();
    const minutes = Math.floor(elapsedMs / (1000 * 60));
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h${mins}min`;
  };

  return (
    <div className="min-h-[100dvh] bg-background relative">
      <div className="absolute inset-x-0 -top-[100px] h-[520px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
      <div className="mx-auto max-w-lg relative">
        
        <div className="relative z-10">
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top mt-4">
            <img src={logoImage} alt="Cari" className="h-6" />
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          <div className="mt-4">
            <WeekCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
          <CalorieHeader consumed={totalCalories} target={caloriesTarget} />

          <main>
            <MacroCards {...macroProps} className="mb-12" />

            {/* Tab Navigation */}
            <div className="flex mx-4 mt-6">
              <button 
                onClick={() => setActiveTab('dieta')}
                className={`flex-1 pb-3 text-center font-medium relative transition-colors ${activeTab === 'dieta' ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Dieta
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full transition-colors ${activeTab === 'dieta' ? 'bg-lime-500 dark:shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-muted'}`} />
              </button>
              <button 
                onClick={() => setActiveTab('jejum')}
                className={`flex-1 pb-3 text-center font-medium relative transition-colors ${activeTab === 'jejum' ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                Jejum
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-full transition-colors ${activeTab === 'jejum' ? 'bg-lime-500 dark:shadow-[0_0_10px_rgba(132,204,22,0.5)]' : 'bg-muted'}`} />
              </button>
            </div>

            {/* Content List */}
            <div className="px-4 py-4 space-y-3">
              {activeTab === 'dieta' ? (
                <div className="space-y-3">
                  {loading ? (
                    <>
                      <Skeleton className="h-32 rounded-2xl" />
                      <Skeleton className="h-32 rounded-2xl" />
                    </>
                  ) : meals.length > 0 ? (
                    meals.map(meal => (
                      <SwipeableRow key={meal.id} onDelete={() => setMealToDelete(meal)}>
                        <MealCard meal={meal} dailyTarget={caloriesTarget} />
                      </SwipeableRow>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhuma refeição registrada hoje</p>
                      <button onClick={handleOpenModal} className="mt-4 text-lime-500 font-medium">
                        Adicionar primeira refeição
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {fastingSessions.length > 0 ? (
                    fastingSessions.map(session => (
                      <SwipeableRow key={session.id} onDelete={() => setSessionToDelete(session.id)}>
                        <div className="p-4 rounded-2xl bg-card border border-border dark:border-primary/10 dark:hover:border-primary/20 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full mt-1 ${session.status === 'completed' ? 'bg-lime-500/20' : 'bg-orange-500/20'}`}>
                              {session.status === 'completed' ? (
                                <Clock className="h-5 w-5 text-lime-500" />
                              ) : (
                                <Pause className="h-5 w-5 text-orange-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-foreground">
                                  {session.status === 'completed' 
                                    ? `Jejum de ${session.target_hours}h concluído`
                                    : `Jejum de ${formatPausedTime(session)} pausado`
                                  }
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(session.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                {session.end_time && ` - ${new Date(session.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </SwipeableRow>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Nenhum jejum registrado hoje</p>
                      <Link to="/fasting" className="mt-4 text-lime-500 font-medium block">
                        Iniciar jejum
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {activeTab === 'dieta' && <FloatingActionButton onClick={handleOpenModal} />}
      <BottomNav />
      
      <MealInputDialog open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={() => {}} onPhotoSubmitted={handleCloseModal} />
      
      <DeleteConfirmationDrawer
        open={!!mealToDelete}
        onOpenChange={(open) => !open && setMealToDelete(null)}
        onConfirm={handleDeleteMeal}
        title="Deletar refeição?"
        description="Você perderá todos os dados e macros desta refeição."
      />
      
      <DeleteConfirmationDrawer
        open={!!sessionToDelete}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
        onConfirm={handleDeleteSession}
        title="Deletar jejum?"
        description="Você perderá o registro deste jejum."
      />
    </div>
  );
}