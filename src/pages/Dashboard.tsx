import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { WeekCalendar } from '@/components/dashboard/WeekCalendar';
import { CalorieHeader } from '@/components/dashboard/CalorieHeader';
import { MacroCards } from '@/components/dashboard/MacroCards';
import { MealCard } from '@/components/dashboard/MealCard';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logoImage from '@/assets/logo-cari.png';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch meals for selected date
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMeals = async () => {
      try {
        setLoading(true);
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
          console.error('Error fetching meals:', error);
          toast({
            title: '❌ Erro ao carregar',
            description: 'Não foi possível carregar as refeições.',
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          const entries: TimelineEntry[] = data.map(log => ({
            id: log.id,
            type: 'meal' as const,
            time: new Date(log.created_at).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            created_at: log.created_at,
            entry_method: log.image_url ? 'ai' as const : 'manual' as const,
            food_name: log.food_name || '',
            calories: log.calories || 0,
            image_url: log.image_url,
            is_emotional: log.is_emotional || false,
            hunger_level: log.hunger_level,
            ai_analysis: typeof log.ai_analysis === 'string' ? log.ai_analysis : log.ai_analysis as any,
            status: log.status || 'manual',
          }));
          setMeals(entries);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();

    // Realtime subscription
    const channel = supabase
      .channel('dashboard-meals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchMeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate]);

  // Calculate totals
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const caloriesTarget = profile?.daily_calories_target || 2000;

  // Calculate macros from meals with AI analysis
  const totalMacros = meals.reduce((acc, meal) => {
    const analysis = typeof meal.ai_analysis === 'object' ? meal.ai_analysis : null;
    return {
      protein: acc.protein + (analysis?.protein || 0),
      carbs: acc.carbs + (analysis?.carbs || 0),
      fat: acc.fat + (analysis?.fat || 0),
    };
  }, { protein: 0, carbs: 0, fat: 0 });

  // Target macros (example targets, could come from profile)
  const macroTargets = { protein: 150, carbs: 250, fat: 70 };

  const handlePhotoSubmitted = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-[100dvh] pb-24 bg-background relative">
      {/* Green Gradient Background - stops at middle of cards */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
      
      <div className="mx-auto max-w-lg relative z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
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

        {/* Week Calendar */}
        <WeekCalendar 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
        />

        {/* Calorie Header */}
        <CalorieHeader 
          consumed={totalCalories} 
          target={caloriesTarget} 
        />

        {/* Main Content */}
        <main>
          {/* Macro Cards */}
          <MacroCards
            protein={{ 
              value: totalMacros.protein, 
              percentage: Math.round((totalMacros.protein / macroTargets.protein) * 100) 
            }}
            carbs={{ 
              value: totalMacros.carbs, 
              percentage: Math.round((totalMacros.carbs / macroTargets.carbs) * 100) 
            }}
            fat={{ 
              value: totalMacros.fat, 
              percentage: Math.round((totalMacros.fat / macroTargets.fat) * 100) 
            }}
          />

        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 my-4">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mx-4">
          <button className="flex-1 py-3 text-center text-muted-foreground font-medium relative">
            Dieta
            <motion.div 
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
            />
          </button>
          <button 
            onClick={() => navigate('/fasting')}
            className="flex-1 py-3 text-center text-muted-foreground font-medium"
          >
            Jejum
          </button>
        </div>

        {/* Meal List */}
        <div className="px-4 py-4 space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </>
          ) : meals.length > 0 ? (
            meals.map((meal) => (
              <MealCard 
                key={meal.id} 
                meal={meal} 
                dailyTarget={caloriesTarget}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                Nenhuma refeição registrada hoje
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-primary font-medium"
              >
                Adicionar primeira refeição
              </button>
            </motion.div>
          )}
        </div>
        </main>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Meal Input Modal */}
      <MealInputDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={() => {}}
        onPhotoSubmitted={handlePhotoSubmitted}
      />
    </div>
  );
}
