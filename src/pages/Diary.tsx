import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Calendar, Camera, Pencil, Heart, Clock } from 'lucide-react';

const mockMeals = [
  {
    id: 1,
    time: '12:30',
    type: 'ai',
    description: 'Salada com frango grelhado',
    calories: 450,
    isEmotional: false,
    hungerLevel: 3,
  },
  {
    id: 2,
    time: '15:45',
    type: 'manual',
    description: 'Lanche da tarde - Maçã com pasta de amendoim',
    calories: 180,
    isEmotional: true,
    hungerLevel: 7,
  },
  {
    id: 3,
    time: '19:00',
    type: 'ai',
    description: 'Peixe grelhado com legumes',
    calories: 380,
    isEmotional: false,
    hungerLevel: 4,
  },
];

export default function Diary() {
  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">Diário</h1>
              <p className="text-muted-foreground">Suas refeições de hoje</p>
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
                  1.010
                  <span className="text-base font-normal text-muted-foreground">/1.800</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Refeições</p>
                <p className="text-3xl font-bold text-secondary tabular-nums">3</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '56%' }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </motion.div>

          {/* Meals List */}
          <div className="space-y-3">
            {mockMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-2xl bg-card border border-border press-effect cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    meal.type === 'ai' ? 'gradient-primary' : 'bg-muted'
                  }`}>
                    {meal.type === 'ai' ? (
                      <Camera className="h-5 w-5 text-white" />
                    ) : (
                      <Pencil className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {meal.time}
                      </span>
                      {meal.isEmotional && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                          <Heart className="h-3 w-3" />
                          Emocional
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-foreground font-medium truncate">
                      {meal.description}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meal.calories} kcal
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty state placeholder */}
          {mockMeals.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nenhuma refeição registrada hoje
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use o botão + para adicionar
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
