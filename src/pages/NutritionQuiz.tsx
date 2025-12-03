import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Zap, Moon, Target, ChefHat, Wheat, Beef, Clock, Heart, TrendingUp, Calendar, UtensilsCrossed, ShieldAlert, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  dbColumn: string;
  options: string[];
  icon: LucideIcon;
  color: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Como você come?",
    dbColumn: "eating_habit",
    options: ["Rápido/Impulso", "Por Ansiedade", "Só com Fome", "Disciplinado", "Esqueço de comer"],
    icon: Zap,
    color: "text-violet-500"
  },
  {
    id: 2,
    question: "Sente fome à noite?",
    dbColumn: "night_hunger",
    options: ["Sempre", "Às vezes", "Quase nunca"],
    icon: Moon,
    color: "text-indigo-500"
  },
  {
    id: 3,
    question: "Nível de disciplina?",
    dbColumn: "discipline_level",
    options: ["Baixo", "Médio", "Alto"],
    icon: Target,
    color: "text-teal-500"
  },
  {
    id: 4,
    question: "Tempo para cozinhar?",
    dbColumn: "cooking_time",
    options: ["Zero", "Pouco", "Médio", "Bastante"],
    icon: ChefHat,
    color: "text-amber-500"
  },
  {
    id: 5,
    question: "Gosta de carboidratos?",
    dbColumn: "carb_preference",
    options: ["Amo", "Gosto", "Tanto faz", "Evito"],
    icon: Wheat,
    color: "text-yellow-500"
  },
  {
    id: 6,
    question: "Consumo de carne?",
    dbColumn: "meat_consumption",
    options: ["Muito", "Normal", "Pouco", "Não como"],
    icon: Beef,
    color: "text-rose-500"
  },
  {
    id: 7,
    question: "Experiência com jejum?",
    dbColumn: "fasting_history",
    options: ["Horrível", "Difícil", "Fácil", "Nunca tentei"],
    icon: Clock,
    color: "text-violet-500"
  },
  {
    id: 8,
    question: "Come mais por...",
    dbColumn: "eating_trigger",
    options: ["Fome", "Ansiedade", "Rotina", "Tédio"],
    icon: Heart,
    color: "text-pink-500"
  },
  {
    id: 9,
    question: "Objetivo principal?",
    dbColumn: "main_goal",
    options: ["Emagrecer Rápido", "Saúde", "Energia"],
    icon: TrendingUp,
    color: "text-teal-500"
  },
  {
    id: 10,
    question: "Preferência de rotina?",
    dbColumn: "structure_preference",
    options: ["Regras Simples", "Liberdade", "Rotina Fixa"],
    icon: Calendar,
    color: "text-blue-500"
  },
  {
    id: 11,
    question: "Quantas refeições por dia?",
    dbColumn: "meals_per_day",
    options: ["1-2", "3-4", "5+"],
    icon: UtensilsCrossed,
    color: "text-orange-500"
  },
  {
    id: 12,
    question: "Alguma restrição alimentar?",
    dbColumn: "dietary_restrictions",
    options: ["Sem Lactose", "Sem Glúten", "Vegetariano", "Nenhuma"],
    icon: ShieldAlert,
    color: "text-emerald-500"
  }
];

export default function NutritionQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep - 1];
  const progressPercentage = (currentStep / questions.length) * 100;

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
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('nutrition_assessments')
        .insert({
          user_id: user.id,
          ...answers
        });

      if (error) throw error;

      toast({
        title: '✅ Mapeamento Concluído!',
        description: 'A IA está analisando seu perfil...',
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
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="press-effect"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              Passo {currentStep} de {questions.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {!isSubmitting ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Question */}
                <div className="text-center space-y-4">
                  {/* Icon Illustration */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-card border border-border/50"
                  >
                    <currentQuestion.icon className={`h-10 w-10 ${currentQuestion.color}`} />
                  </motion.div>

                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {currentQuestion.question}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Escolha a opção que mais se encaixa com você
                    </p>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.dbColumn] === option;
                    return (
                      <motion.button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-4 rounded-2xl border transition-all text-left press-effect ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-violet'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-accent/30'
                        }`}
                      >
                        <span className={`text-base font-medium ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {option}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Submit Button (only on last question) */}
                {currentStep === questions.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4"
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={!isComplete}
                      className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-lg press-effect shadow-violet"
                    >
                      Descobrir Minha Dieta
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Analisando seu perfil...
                </h2>
                <p className="text-muted-foreground">
                  A IA está processando suas respostas
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
