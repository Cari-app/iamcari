import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface DietType {
  id: string;
  name: string;
  icon: string;
  short_description: string;
  full_description: string;
  color_theme: string;
}

export default function DietResult() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diet, setDiet] = useState<DietType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDietResult = async () => {
      try {
        // Fetch the most recent nutrition assessment
        const { data: assessment, error: assessmentError } = await supabase
          .from('nutrition_assessments')
          .select('suggested_diet')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (assessmentError) throw assessmentError;

        if (!assessment || !assessment.suggested_diet) {
          toast({
            title: "Quiz não completado",
            description: "Complete o mapeamento primeiro",
            variant: "destructive",
          });
          navigate('/nutrition-quiz');
          return;
        }

        // Fetch diet details using the suggested_diet
        const { data: dietData, error: dietError } = await supabase
          .from('diet_types')
          .select('*')
          .eq('id', assessment.suggested_diet)
          .maybeSingle();

        if (dietError) throw dietError;

        if (!dietData) {
          toast({
            title: "Erro ao carregar resultado",
            description: "Dieta não encontrada",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }

        setDiet(dietData);
      } catch (error) {
        console.error('Error fetching diet result:', error);
        toast({
          title: "Erro ao carregar resultado",
          description: "Tente novamente",
          variant: "destructive",
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDietResult();
  }, [user, navigate]);

  const getColorClasses = (theme: string) => {
    const colorMap: Record<string, { glow: string; border: string; text: string }> = {
      violet: { glow: 'shadow-violet-500/50', border: 'border-violet-500/50', text: 'text-violet-400' },
      teal: { glow: 'shadow-teal-500/50', border: 'border-teal-500/50', text: 'text-teal-400' },
      red: { glow: 'shadow-red-500/50', border: 'border-red-500/50', text: 'text-red-400' },
      orange: { glow: 'shadow-orange-500/50', border: 'border-orange-500/50', text: 'text-orange-400' },
      blue: { glow: 'shadow-blue-500/50', border: 'border-blue-500/50', text: 'text-blue-400' },
      green: { glow: 'shadow-green-500/50', border: 'border-green-500/50', text: 'text-green-400' },
    };
    return colorMap[theme] || colorMap.violet;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!diet) return null;

  const colors = getColorClasses(diet.color_theme);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Resultado</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-lg mx-auto">
        {/* Reveal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Análise Concluída
            </p>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sua Estratégia Ideal é...
          </h2>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`relative rounded-2xl border bg-card/50 backdrop-blur-xl p-8 mb-6 shadow-2xl ${colors.border} ${colors.glow}`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-background/50 border border-border flex items-center justify-center">
              <span className="text-5xl">{diet.icon}</span>
            </div>
          </div>

          {/* Diet Name */}
          <h3 className={`text-3xl font-bold text-center mb-2 ${colors.text}`}>
            {diet.name}
          </h3>

          {/* Short Description */}
          <p className="text-muted-foreground text-center leading-relaxed mb-4">
            {diet.full_description?.split('\n')[0] || 'Sua dieta personalizada'}
          </p>

          <Button
            onClick={() => navigate(`/diet-detail?diet=${diet.id}`)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Ver Guia Completo
          </Button>
        </motion.div>

        {/* Why This Diet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl border border-border bg-card/30 backdrop-blur-xl p-6 mb-6"
        >
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Por que esta dieta?
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Baseado na sua disciplina, preferências e objetivos, esta dieta vai otimizar seus resultados de forma sustentável e eficaz.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12"
            size="lg"
          >
            Ir para o Dashboard
          </Button>
          <Button
            onClick={() => navigate('/diets')}
            variant="outline"
            className="w-full h-12"
            size="lg"
          >
            Explorar Outras Dietas
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
