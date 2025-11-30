import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { QuickAssessmentBar } from '@/components/diary/QuickAssessmentBar';
import { MoodCheckInDrawer } from '@/components/diary/MoodCheckInDrawer';
import { WeightInputDialog } from '@/components/diary/WeightInputDialog';
import { WaterInputDialog } from '@/components/diary/WaterInputDialog';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { MealEditDialog } from '@/components/diary/MealEditDialog';
import { TimelineEntryCard } from '@/components/diary/TimelineEntryCard';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { Calendar, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry, EmotionTag } from '@/types';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Diary() {
  const { user, profile } = useAuth();
  const [moodDrawerOpen, setMoodDrawerOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [mealEditDialogOpen, setMealEditDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<TimelineEntry | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch today's meal logs from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTodayLogs = async () => {
      // Get start of today in user's timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meal logs:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const entries: TimelineEntry[] = data.map(log => {
          const baseEntry = {
            id: log.id,
            time: new Date(log.created_at).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            created_at: log.created_at,
          };

          // Map based on entry_type
          if (log.entry_type === 'meal') {
            return {
              ...baseEntry,
              type: 'meal' as const,
              entry_method: log.image_url ? 'ai' as const : 'manual' as const,
              food_name: log.food_name || '',
              calories: log.calories || 0,
              image_url: log.image_url,
              is_emotional: log.is_emotional || false,
              hunger_level: log.hunger_level,
              ai_analysis: log.ai_analysis,
            };
          } else if (log.entry_type === 'water') {
            return {
              ...baseEntry,
              type: 'water' as const,
              value: log.metric_value || 0,
            };
          } else if (log.entry_type === 'weight') {
            return {
              ...baseEntry,
              type: 'weight' as const,
              value: log.metric_value || 0,
            };
          } else if (log.entry_type === 'mood') {
            return {
              ...baseEntry,
              type: 'mood' as const,
              mood_score: log.hunger_level || 5,
              emotion_tag: (log.mood_tag || 'calmo') as EmotionTag,
            };
          }

          return baseEntry as TimelineEntry;
        });
        
        setTimeline(entries);
      }
      setLoading(false);
    };

    fetchTodayLogs();

    // Set up realtime subscription for automatic updates
    const channel = supabase
      .channel('meal-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch data when changes occur
          fetchTodayLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetchTrigger]);

  // Calculate totals from timeline
  const todayCalories = timeline
    .filter(e => e.type === 'meal' && e.calories)
    .reduce((sum, e) => sum + (e.calories || 0), 0);
  
  const todayMeals = timeline.filter(e => e.type === 'meal').length;
  
  const waterTotal = timeline
    .filter(e => e.type === 'water')
    .reduce((sum, e) => sum + (e.value || 0), 0);
  
  const lastWeight = timeline
    .filter(e => e.type === 'weight')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.value || 0;

  const handleMoodSubmit = async (data: { energyLevel: number; emotion: EmotionTag }) => {
    if (!user) return;

    const { data: logData, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        entry_type: 'mood',
        hunger_level: data.energyLevel,
        mood_tag: data.emotion,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting mood:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível salvar o check-in',
        variant: 'destructive',
      });
      return;
    }

    if (logData) {
      const newEntry: TimelineEntry = {
        id: logData.id,
        type: 'mood',
        time: new Date(logData.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        created_at: logData.created_at,
        mood_score: data.energyLevel,
        emotion_tag: data.emotion,
      };
      
      setTimeline(prev => [newEntry, ...prev]);
      
      toast({
        title: '🧠 Check-in registrado',
        description: `Sentindo-se ${data.emotion} com energia ${data.energyLevel}/10`,
      });
    }
  };

  const handleWaterSubmit = async (amount: number) => {
    if (!user) return;

    const { data: logData, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        entry_type: 'water',
        metric_value: amount,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting water:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível salvar a hidratação',
        variant: 'destructive',
      });
      return;
    }

    if (logData) {
      const newEntry: TimelineEntry = {
        id: logData.id,
        type: 'water',
        time: new Date(logData.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        created_at: logData.created_at,
        value: amount,
      };
      
      setTimeline(prev => [newEntry, ...prev]);
      
      const newTotal = waterTotal + amount;
      toast({
        title: '💧 Água registrada',
        description: `+${amount}ml • Total hoje: ${newTotal}ml`,
      });
    }
  };

  const handleWeightSubmit = async (weight: number) => {
    if (!user) return;

    // Insert weight log
    const { data: logData, error: logError } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        entry_type: 'weight',
        metric_value: weight,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error inserting weight:', logError);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível salvar o peso',
        variant: 'destructive',
      });
      return;
    }

    // Update profile weight
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ weight })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile weight:', profileError);
    }

    if (logData) {
      const newEntry: TimelineEntry = {
        id: logData.id,
        type: 'weight',
        time: new Date(logData.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        created_at: logData.created_at,
        value: weight,
      };
      
      setTimeline(prev => [newEntry, ...prev]);
      
      toast({
        title: '⚖️ Peso registrado',
        description: `${weight}kg`,
      });
    }
  };

  const handleMealSubmit = async (data: { 
    method: 'ai' | 'manual';
    description: string;
    calories?: number;
    imageUrl?: string;
    isEmotional?: boolean;
  }) => {
    if (!user) return;

    // Para entrada manual, insere no banco
    const { data: logData, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        entry_type: 'meal',
        food_name: data.description,
        calories: data.calories || 0,
        image_url: data.imageUrl || null,
        is_emotional: data.isEmotional || false,
        status: 'manual',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting meal log:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível salvar a refeição',
        variant: 'destructive',
      });
      return;
    }

    if (logData) {
      const newEntry: TimelineEntry = {
        id: logData.id,
        type: 'meal',
        time: new Date(logData.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        created_at: logData.created_at,
        entry_method: data.method,
        food_name: logData.food_name || '',
        calories: logData.calories || 0,
        image_url: logData.image_url,
        is_emotional: logData.is_emotional || false,
      };
      
      setTimeline(prev => [newEntry, ...prev]);
      
      toast({
        title: '🍎 Refeição registrada',
        description: `${data.description}${data.calories ? ` - ${data.calories} kcal` : ''}`,
      });
    }
  };

  const handlePhotoSubmitted = () => {
    // Refetch timeline após foto ser enviada
    setRefetchTrigger(prev => prev + 1);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal log:', error);
      toast({
        title: '❌ Erro ao deletar',
        description: 'Não foi possível remover o registro',
        variant: 'destructive',
      });
      return;
    }

    setTimeline(prev => prev.filter(e => e.id !== id));
    toast({
      title: '🗑️ Registro apagado',
      description: 'O registro foi removido da timeline',
    });
  };

  const handleEditMeal = (entry: TimelineEntry) => {
    setEditingMeal(entry);
    setMealEditDialogOpen(true);
  };

  const handleMealEditSubmit = async (data: {
    food_name: string;
    calories: number;
    is_emotional: boolean;
  }) => {
    if (!user || !editingMeal) return;

    const { error } = await supabase
      .from('meal_logs')
      .update({
        food_name: data.food_name,
        calories: data.calories,
        is_emotional: data.is_emotional,
      })
      .eq('id', editingMeal.id);

    if (error) {
      console.error('Error updating meal log:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível atualizar a refeição',
        variant: 'destructive',
      });
      return;
    }

    // Update timeline
    setTimeline(prev => prev.map(entry => 
      entry.id === editingMeal.id 
        ? {
            ...entry,
            food_name: data.food_name,
            calories: data.calories,
            is_emotional: data.is_emotional,
          }
        : entry
    ));

    toast({
      title: '✅ Refeição atualizada',
      description: 'As alterações foram salvas com sucesso',
    });
  };

  // Sort timeline by time (most recent first for display purposes)
  const sortedTimeline = [...timeline].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeB[0] * 60 + timeB[1]) - (timeA[0] * 60 + timeA[1]);
  });

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Diário</h1>
              <p className="text-muted-foreground">Linha do tempo de hoje</p>
            </div>
            <button className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center press-effect">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </button>
          </motion.div>

          {/* Today's Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calorias hoje</p>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {todayCalories.toLocaleString('pt-BR')}
                  <span className="text-lg font-medium text-foreground/60">
                    /{(profile?.daily_calories_target || 2000).toLocaleString('pt-BR')}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Refeições</p>
                <p className="text-3xl font-bold text-secondary tabular-nums">{todayMeals}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((todayCalories / (profile?.daily_calories_target || 2000)) * 100, 100)}%` 
                }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full gradient-primary"
              />
            </div>

            {/* Water indicator */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">💧 Hidratação</span>
              <span className="text-sky-400 font-medium tabular-nums">{waterTotal}ml</span>
            </div>
          </motion.div>

          {/* Quick Assessment Bar */}
          <QuickAssessmentBar
            onMoodClick={() => setMoodDrawerOpen(true)}
            onWaterClick={() => setWaterDialogOpen(true)}
            onWeightClick={() => setWeightDialogOpen(true)}
            onMealClick={() => setMealDialogOpen(true)}
          />

          {/* Timeline */}
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-sm font-medium text-muted-foreground"
            >
              Linha do tempo
            </motion.h2>
            
            {sortedTimeline.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <SwipeableRow onDelete={() => handleDeleteEntry(entry.id)}>
                  <TimelineEntryCard 
                    entry={entry} 
                    onEdit={entry.type === 'meal' ? () => handleEditMeal(entry) : undefined}
                  />
                </SwipeableRow>
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {sortedTimeline.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nenhum registro hoje
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use os botões acima para começar
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      <MoodCheckInDrawer
        open={moodDrawerOpen}
        onOpenChange={setMoodDrawerOpen}
        onSubmit={handleMoodSubmit}
      />
      
      <WeightInputDialog
        open={weightDialogOpen}
        onOpenChange={setWeightDialogOpen}
        onSubmit={handleWeightSubmit}
        lastWeight={lastWeight}
      />

      <WaterInputDialog
        open={waterDialogOpen}
        onOpenChange={setWaterDialogOpen}
        onSubmit={handleWaterSubmit}
      />

      <MealInputDialog
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
        onSubmit={handleMealSubmit}
        onPhotoSubmitted={handlePhotoSubmitted}
      />

      <MealEditDialog
        open={mealEditDialogOpen}
        onOpenChange={setMealEditDialogOpen}
        onSubmit={handleMealEditSubmit}
        initialData={{
          food_name: editingMeal?.food_name || '',
          calories: editingMeal?.calories,
          is_emotional: editingMeal?.is_emotional,
        }}
      />

      <BottomNav />
    </div>
  );
}
