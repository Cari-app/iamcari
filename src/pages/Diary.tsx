import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { QuickAssessmentBar } from '@/components/diary/QuickAssessmentBar';
import { MoodCheckInDrawer } from '@/components/diary/MoodCheckInDrawer';
import { WeightInputDialog } from '@/components/diary/WeightInputDialog';
import { WaterInputDialog } from '@/components/diary/WaterInputDialog';
import { MealInputDialog } from '@/components/diary/MealInputDialog';
import { TimelineEntryCard } from '@/components/diary/TimelineEntryCard';
import { SwipeableRow } from '@/components/diary/SwipeableRow';
import { Calendar, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TimelineEntry, EmotionTag } from '@/types';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Mock timeline data with mixed entry types
const mockTimeline: TimelineEntry[] = [
  {
    id: '1',
    type: 'mood',
    time: '07:30',
    created_at: new Date().toISOString(),
    mood_score: 7,
    emotion_tag: 'focado',
  },
  {
    id: '2',
    type: 'water',
    time: '08:00',
    created_at: new Date().toISOString(),
    value: 250,
  },
  {
    id: '3',
    type: 'meal',
    time: '12:30',
    created_at: new Date().toISOString(),
    entry_method: 'ai',
    food_name: 'Salada com frango grelhado',
    calories: 450,
    is_emotional: false,
    hunger_level: 3,
  },
  {
    id: '4',
    type: 'water',
    time: '14:00',
    created_at: new Date().toISOString(),
    value: 250,
  },
  {
    id: '5',
    type: 'meal',
    time: '15:45',
    created_at: new Date().toISOString(),
    entry_method: 'manual',
    food_name: 'Lanche da tarde - Maçã com pasta de amendoim',
    calories: 180,
    is_emotional: true,
    hunger_level: 7,
  },
  {
    id: '6',
    type: 'weight',
    time: '18:00',
    created_at: new Date().toISOString(),
    value: 75.4,
  },
  {
    id: '7',
    type: 'meal',
    time: '19:00',
    created_at: new Date().toISOString(),
    entry_method: 'ai',
    food_name: 'Peixe grelhado com legumes',
    calories: 380,
    is_emotional: false,
    hunger_level: 4,
  },
];

export default function Diary() {
  const { user } = useAuth();
  const [moodDrawerOpen, setMoodDrawerOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [waterDialogOpen, setWaterDialogOpen] = useState(false);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [waterTotal, setWaterTotal] = useState(0);
  const [lastWeight, setLastWeight] = useState(0);

  // Fetch meal logs from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meal logs:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const entries: TimelineEntry[] = data.map(log => ({
          id: log.id,
          type: 'meal',
          time: new Date(log.created_at).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          created_at: log.created_at,
          entry_method: log.entry_type as 'ai' | 'manual',
          food_name: log.food_name || '',
          calories: log.calories || 0,
          image_url: log.image_url,
          is_emotional: log.is_emotional || false,
          hunger_level: log.hunger_level,
        }));
        setTimeline(entries);
      }
      setLoading(false);
    };

    fetchLogs();
  }, [user]);

  // Calculate totals from timeline
  const todayCalories = timeline
    .filter(e => e.type === 'meal' && e.calories)
    .reduce((sum, e) => sum + (e.calories || 0), 0);
  
  const todayMeals = timeline.filter(e => e.type === 'meal').length;

  const handleMoodSubmit = (data: { energyLevel: number; emotion: EmotionTag }) => {
    const now = new Date();
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      type: 'mood',
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      created_at: now.toISOString(),
      mood_score: data.energyLevel,
      emotion_tag: data.emotion,
    };
    setTimeline(prev => [newEntry, ...prev]);
    toast({
      title: '🧠 Check-in registrado',
      description: `Sentindo-se ${data.emotion} com energia ${data.energyLevel}/10`,
    });
  };

  const handleWaterSubmit = (amount: number) => {
    const now = new Date();
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      type: 'water',
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      created_at: now.toISOString(),
      value: amount,
    };
    setTimeline(prev => [newEntry, ...prev]);
    setWaterTotal(prev => prev + amount);
    toast({
      title: '💧 Água registrada',
      description: `+${amount}ml • Total hoje: ${waterTotal + amount}ml`,
    });
  };

  const handleWeightSubmit = (weight: number) => {
    const now = new Date();
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      type: 'weight',
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      created_at: now.toISOString(),
      value: weight,
    };
    setTimeline(prev => [newEntry, ...prev]);
    setLastWeight(weight);
    toast({
      title: '⚖️ Peso registrado',
      description: `${weight}kg`,
    });
  };

  const handleMealSubmit = async (data: { 
    method: 'ai' | 'manual';
    description: string;
    calories?: number;
    imageUrl?: string;
    isEmotional?: boolean;
  }) => {
    if (!user) return;

    const { data: logData, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: user.id,
        food_name: data.description,
        calories: data.calories || 0,
        image_url: data.imageUrl || null,
        is_emotional: data.isEmotional || false,
        entry_type: data.method,
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
        entry_method: logData.entry_type as 'ai' | 'manual',
        food_name: logData.food_name || '',
        calories: logData.calories || 0,
        is_emotional: logData.is_emotional || false,
      };
      
      setTimeline(prev => [newEntry, ...prev]);
      
      toast({
        title: data.method === 'ai' ? '📸 Refeição analisada' : '🍎 Refeição registrada',
        description: `${data.description}${data.calories ? ` - ${data.calories} kcal` : ''}`,
      });
    }
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
                  <span className="text-lg font-medium text-foreground/60">/1.800</span>
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
                animate={{ width: `${Math.min((todayCalories / 1800) * 100, 100)}%` }}
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
                  <TimelineEntryCard entry={entry} />
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
      />

      <BottomNav />
    </div>
  );
}
