import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface DietType {
  id: string;
  name: string;
  icon: string;
  short_description: string;
  full_description: string;
  color_theme: string;
}

export default function DietResult() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [diet, setDiet] = useState<DietType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDietResult = async () => {
      try {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!diet) return null;

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Green Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#22c55e] to-[#16a34a] -z-10" />

      {/* Header */}
      <header 
        className="px-4 flex items-center justify-between"
        style={{ 
          paddingTop: isMobile 
            ? 'calc(1rem + env(safe-area-inset-top, 0px))' 
            : '1rem' 
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="xs" forceDark />
        </div>
        <button onClick={() => navigate('/profile')} className="press-effect">
          <Avatar className="h-10 w-10 ring-2 ring-white/30">
            <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
            <AvatarFallback className="bg-white/20">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6 max-w-lg mx-auto">
        {/* Reveal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-white" />
            <p className="text-sm text-white/80 uppercase tracking-wider">
              Análise Concluída
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Sua Estratégia Ideal é...
          </h2>
        </motion.div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl border border-border bg-card p-8 mb-6 shadow-lg"
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-5xl">{diet.icon}</span>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-center mb-2 text-primary">
            {diet.name}
          </h3>

          <p className="text-muted-foreground text-center leading-relaxed mb-4">
            {diet.full_description?.split('\n')[0]?.replace(/^##\s*/, '') || 'Sua dieta personalizada'}
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
          className="rounded-2xl border border-border bg-card p-6 mb-6"
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

      <BottomNav />
    </div>
  );
}
