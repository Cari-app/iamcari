import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Zap, Moon, Target, ChefHat, Wheat, Beef, Clock, Heart, TrendingUp, Calendar, UtensilsCrossed, ShieldAlert, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import logoImage from '@/assets/logo-cari.png';
interface Question {
  id: number;
  question: string;
  dbColumn: string;
  options: string[];
  icon: LucideIcon;
  color: string;
}
const questions: Question[] = [{
  id: 1,
  question: "Como você come?",
  dbColumn: "eating_habit",
  options: ["Rápido/Impulso", "Por Ansiedade", "Só com Fome", "Disciplinado", "Esqueço de comer"],
  icon: Zap,
  color: "text-violet-500"
}, {
  id: 2,
  question: "Sente fome à noite?",
  dbColumn: "night_hunger",
  options: ["Sempre", "Às vezes", "Quase nunca"],
  icon: Moon,
  color: "text-indigo-500"
}, {
  id: 3,
  question: "Nível de disciplina?",
  dbColumn: "discipline_level",
  options: ["Baixo", "Médio", "Alto"],
  icon: Target,
  color: "text-teal-500"
}, {
  id: 4,
  question: "Tempo para cozinhar?",
  dbColumn: "cooking_time",
  options: ["Zero", "Pouco", "Médio", "Bastante"],
  icon: ChefHat,
  color: "text-amber-500"
}, {
  id: 5,
  question: "Gosta de carboidratos?",
  dbColumn: "carb_preference",
  options: ["Amo", "Gosto", "Tanto faz", "Evito"],
  icon: Wheat,
  color: "text-yellow-500"
}, {
  id: 6,
  question: "Consumo de carne?",
  dbColumn: "meat_consumption",
  options: ["Muito", "Normal", "Pouco", "Não como"],
  icon: Beef,
  color: "text-rose-500"
}, {
  id: 7,
  question: "Experiência com jejum?",
  dbColumn: "fasting_history",
  options: ["Horrível", "Difícil", "Fácil", "Nunca tentei"],
  icon: Clock,
  color: "text-violet-500"
}, {
  id: 8,
  question: "Come mais por...",
  dbColumn: "eating_trigger",
  options: ["Fome", "Ansiedade", "Rotina", "Tédio"],
  icon: Heart,
  color: "text-pink-500"
}, {
  id: 9,
  question: "Objetivo principal?",
  dbColumn: "main_goal",
  options: ["Emagrecer Rápido", "Saúde", "Energia"],
  icon: TrendingUp,
  color: "text-teal-500"
}, {
  id: 10,
  question: "Preferência de rotina?",
  dbColumn: "structure_preference",
  options: ["Regras Simples", "Liberdade", "Rotina Fixa"],
  icon: Calendar,
  color: "text-blue-500"
}, {
  id: 11,
  question: "Quantas refeições por dia?",
  dbColumn: "meals_per_day",
  options: ["1-2", "3-4", "5+"],
  icon: UtensilsCrossed,
  color: "text-orange-500"
}, {
  id: 12,
  question: "Alguma restrição alimentar?",
  dbColumn: "dietary_restrictions",
  options: ["Sem Lactose", "Sem Glúten", "Vegetariano", "Nenhuma"],
  icon: ShieldAlert,
  color: "text-emerald-500"
}];
export default function NutritionQuiz() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentQuestion = questions[currentStep - 1];
  const progressPercentage = currentStep / questions.length * 100;
  const handleOptionSelect = (option: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.dbColumn]: option
    };
    setAnswers(newAnswers);

    // Auto-advance to next question after selection
    setTimeout(() => {
      if (currentStep < questions.length) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: '❌ Erro',
        description: 'Você precisa estar logado para completar o mapeamento.',
        variant: 'destructive'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        error
      } = await supabase.from('nutrition_assessments').insert({
        user_id: user.id,
        ...answers
      });
      if (error) throw error;
      toast({
        title: '✅ Mapeamento Concluído!',
        description: 'A IA está analisando seu perfil...'
      });

      // Wait 2 seconds for DB trigger to process
      setTimeout(() => {
        navigate('/diet-result');
      }, 2000);
    } catch (error) {
      console.error('Error submitting nutrition assessment:', error);
      toast({
        title: '❌ Erro ao enviar',
        description: 'Não foi possível salvar suas respostas. Tente novamente.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
    }
  };
  const isComplete = Object.keys(answers).length === questions.length;
  return <div className="min-h-[100dvh] pb-8 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-8" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/profile">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          {/* Progress Section */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Mapeamento Nutricional</span>
              <span className="text-sm font-medium text-white/60">
                {currentStep}/{questions.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Main Content */}
          <main className="px-4 pt-4">
            <AnimatePresence mode="wait">
              {!isSubmitting ? <motion.div key={currentStep} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }} className="space-y-6">
                  {/* Question Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-card border border-border"
                  >
                    <div className="text-center space-y-4 mb-6">
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#84cc16]/20">
                        <currentQuestion.icon className="h-8 w-8 text-[#84cc16]" />
                      </div>

                      <div>
                        <h1 className="text-xl font-bold text-foreground mb-1">
                          {currentQuestion.question}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Escolha a opção que mais se encaixa
                        </p>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {currentQuestion.options.map(option => {
                        const isSelected = answers[currentQuestion.dbColumn] === option;
                        return <motion.button key={option} onClick={() => handleOptionSelect(option)} whileTap={{ scale: 0.98 }} className={`w-full p-4 rounded-xl border transition-all text-left ${isSelected ? 'border-[#84cc16] bg-[#84cc16]/10' : 'border-border bg-muted/30 hover:border-[#84cc16]/50'}`}>
                              <span className={`text-sm font-medium ${isSelected ? 'text-[#84cc16]' : 'text-foreground'}`}>
                                {option}
                              </span>
                            </motion.button>;
                      })}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  {currentStep === questions.length && <motion.div initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }}>
                      <Button onClick={handleSubmit} disabled={!isComplete} className="w-full h-14 rounded-2xl bg-[#84cc16] hover:bg-[#84cc16]/90 text-white font-semibold text-lg">
                        Descobrir Minha Dieta
                      </Button>
                    </motion.div>}
                </motion.div> : <motion.div initial={{
                  opacity: 0,
                  scale: 0.9
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#84cc16]/20 mb-6">
                    <Loader2 className="h-10 w-10 text-[#84cc16] animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Analisando seu perfil...
                  </h2>
                  <p className="text-muted-foreground">
                    A IA está processando suas respostas
                  </p>
                </motion.div>}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>;
}