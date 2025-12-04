import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import logoImage from '@/assets/logo-cari.png';

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
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logoImage} alt="Cari" className="h-8" />
            </div>
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center px-4 mt-4"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-white" />
              <p className="text-sm text-white/80 uppercase tracking-wider">
                Análise Concluída
              </p>
            </div>
            <h2 className="text-2xl text-white font-semibold">
              Sua Estratégia Ideal é...
            </h2>
          </motion.div>

          <main className="px-4 pt-6 space-y-4">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center">
                  <span className="text-5xl">{diet.icon}</span>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-center mb-2 text-[#84cc16]">
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
              className="rounded-2xl border border-border bg-card p-6"
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
      </div>

      <BottomNav />
    </div>
  );
}
