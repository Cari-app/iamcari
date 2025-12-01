import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
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
      violet: {
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/50',
        text: 'text-violet-400',
        hover: 'hover:bg-violet-500/20',
      },
      teal: {
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/50',
        text: 'text-teal-400',
        hover: 'hover:bg-teal-500/20',
      },
      blue: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-500/20',
      },
      red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        hover: 'hover:bg-red-500/20',
      },
      orange: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        hover: 'hover:bg-orange-500/20',
      },
      green: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-400',
        hover: 'hover:bg-green-500/20',
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        hover: 'hover:bg-emerald-500/20',
      },
    };

    return colors[colorTheme as keyof typeof colors] || colors.teal;
  };

  const handleDietClick = (dietId: string) => {
    // Navigate to diet result page with the selected diet
    navigate(`/diet-result?diet=${dietId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-6 px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
            Explorar Dietas
          </h1>
          <p className="text-muted-foreground text-sm">
            Descubra qual dieta se encaixa perfeitamente no seu estilo de vida
          </p>
        </motion.div>
      </div>

      {/* Diets Grid */}
      <div className="px-6 space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          diets.map((diet, index) => {
            const colors = getColorClasses(diet.color_theme);
            
            return (
              <motion.div
                key={diet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "glass border-2 cursor-pointer transition-all duration-300",
                    colors.border,
                    colors.hover
                  )}
                  onClick={() => handleDietClick(diet.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Diet Icon */}
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 flex-shrink-0",
                        colors.bg,
                        colors.border
                      )}>
                        {diet.icon}
                      </div>

                      {/* Diet Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-lg font-bold mb-2",
                          colors.text
                        )}>
                          {diet.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {diet.short_description}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3 -ml-3",
                            colors.text
                          )}
                        >
                          Ver mais
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
