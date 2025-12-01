import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Diet {
  id: string;
  name: string;
  icon: string;
  short_description: string;
  full_description: string;
  color_theme: string;
}

export default function ExploreDiets() {
  const navigate = useNavigate();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    try {
      const { data, error } = await supabase
        .from('diet_types')
        .select('id, name, icon, short_description, full_description, color_theme')
        .order('name');

      if (error) throw error;
      if (data) setDiets(data);
    } catch (error) {
      console.error('Error fetching diets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (colorTheme: string) => {
    const colors = {
      violet: 'text-violet-500',
      teal: 'text-teal-500',
      blue: 'text-blue-500',
      red: 'text-red-500',
      orange: 'text-orange-500',
      green: 'text-green-500',
      emerald: 'text-emerald-500',
    };

    return colors[colorTheme as keyof typeof colors] || 'text-teal-500';
  };

  const handleDietClick = (dietId: string) => {
    navigate(`/diet-result?diet=${dietId}`);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-24 pt-[100px]">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 -ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>

            <h1 className="text-2xl font-bold mb-2 text-foreground">
              Explorar Dietas
            </h1>
            <p className="text-muted-foreground text-sm">
              Descubra qual dieta se encaixa perfeitamente no seu estilo de vida
            </p>
          </motion.div>

          {/* Diets Grid - Mobile First */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Skeleton className="h-32 rounded-2xl" />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              {diets.map((diet, index) => {
                const colorClass = getColorClasses(diet.color_theme);
                
                return (
                  <motion.button
                    key={diet.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleDietClick(diet.id)}
                    className="p-5 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-all duration-200 press-effect text-center group"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-3">
                      <div className={cn(
                        "text-4xl transition-transform duration-200 group-hover:scale-110",
                        colorClass
                      )}>
                        {diet.icon}
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className={cn(
                      "text-sm font-semibold mb-2 leading-tight",
                      colorClass
                    )}>
                      {diet.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {diet.short_description}
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              💡 <span className="font-medium">Dica:</span> Clique em qualquer dieta para ver detalhes completos, 
              incluindo alimentos permitidos e exemplo de cardápio
            </p>
          </motion.div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
