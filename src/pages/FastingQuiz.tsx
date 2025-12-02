import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  dbColumn: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Como você come durante o dia?',
    dbColumn: 'eating_pattern',
    options: [
      'Como por impulso',
      'Como por ansiedade',
      'Como quando sinto fome',
      'Pulo refeições sem perceber',
      'Sou disciplinado na maior parte do tempo'
    ]
  },
  {
    id: 2,
    question: 'Como é sua fome à noite?',
    dbColumn: 'night_hunger',
    options: [
      'Muito intensa',
      'Média',
      'Pouca',
      'Quase nenhuma'
    ]
  },
  {
    id: 3,
    question: 'Como você lida com fome?',
    dbColumn: 'hunger_tolerance',
    options: [
      'Me irrito facilmente',
      'Fico ansioso(a)',
      'Consigo segurar um pouco',
      'Lido bem com fome leve',
      'Fome raramente aparece'
    ]
  },
  {
    id: 4,
    question: 'Quantas refeições você costuma fazer?',
    dbColumn: 'meals_per_day',
    options: [
      '1 a 2',
      '3 a 4',
      '5 ou mais'
    ]
  },
  {
    id: 5,
    question: 'Qual é seu nível de ansiedade atual?',
    dbColumn: 'anxiety_level',
    options: [
      'Alto',
      'Moderado',
      'Baixo'
    ]
  },
  {
    id: 6,
    question: 'Como é sua relação com doce?',
    dbColumn: 'sweet_relationship',
    options: [
      'Como todos os dias',
      'Como às vezes, quando bate vontade',
      'Como raramente',
      'Não ligo para doces'
    ]
  },
  {
    id: 7,
    question: 'Como é sua manhã?',
    dbColumn: 'morning_routine',
    options: [
      'Corrida, sem tempo pra nada',
      'Média, consigo comer rápido',
      'Tranquila, gosto de comer pela manhã',
      'Geralmente não sinto fome cedo'
    ]
  },
  {
    id: 8,
    question: 'Você já fez jejum antes?',
    dbColumn: 'fasting_experience',
    options: [
      'Sim, foi horrível',
      'Sim, foi difícil mas deu certo',
      'Sim, foi tranquilo',
      'Nunca tentei'
    ]
  },
  {
    id: 9,
    question: 'Como você lida com regras alimentares?',
    dbColumn: 'rules_tolerance',
    options: [
      'Detesto regras',
      'Gosto de flexibilidade',
      'Consigo seguir algumas regras simples',
      'Sigo regras com facilidade'
    ]
  },
  {
    id: 10,
    question: 'Seus horários de trabalho são...',
    dbColumn: 'work_schedule',
    options: [
      'Caóticos',
      'Variáveis',
      'Previsíveis',
      'Muito fixos'
    ]
  },
  {
    id: 11,
    question: 'Você costuma beliscar entre refeições?',
    dbColumn: 'snacking_habit',
    options: [
      'Sim, o tempo todo',
      'Às vezes',
      'Pouco',
      'Raramente'
    ]
  },
  {
    id: 12,
    question: 'Como é sua energia de manhã?',
    dbColumn: 'morning_energy',
    options: [
      'Péssima',
      'Baixa',
      'Média',
      'Boa',
      'Muito boa'
    ]
  },
  {
    id: 13,
    question: 'Você tem algum desses objetivos?',
    dbColumn: 'main_goals',
    options: [
      'Emagrecer',
      'Controlar ansiedade',
      'Melhorar energia',
      'Organizar rotina alimentar',
      'Reduzir compulsão'
    ]
  },
  {
    id: 14,
    question: 'Como é sua relação emocional com a comida?',
    dbColumn: 'emotional_eating',
    options: [
      'Como por estresse',
      'Como por tédio',
      'Como por hábito',
      'Como só quando sinto fome',
      'Controlo bem minhas emoções'
    ]
  },
  {
    id: 15,
    question: 'Você aguentaria ficar 12 horas sem comer?',
    dbColumn: 'twelve_hour_tolerance',
    options: [
      'Não',
      'Talvez',
      'Sim, tranquilo',
      'Sim, já faço isso naturalmente'
    ]
  }
];

export default function FastingQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const canGoNext = answers[currentQuestion?.dbColumn];

  const handleSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.dbColumn]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('fasting_assessments')
        .insert({
          user_id: user.id,
          ...answers
        });

      if (error) throw error;

      toast({
        title: '✅ Análise concluída!',
        description: 'Estamos preparando seu protocolo personalizado',
      });

      // Redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error submitting fasting quiz:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível salvar suas respostas. Tente novamente.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">
                Quiz Jejum Prime
              </h1>
              <p className="text-sm text-muted-foreground">
                Pergunta {currentStep + 1} de {questions.length}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="mx-auto max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Question */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <RadioGroup
                value={answers[currentQuestion.dbColumn] || ''}
                onValueChange={handleSelect}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-card border-2 border-border hover:border-primary/50 cursor-pointer transition-all press-effect has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`option-${index}`}
                        className="shrink-0"
                      />
                      <span className="text-base font-medium text-foreground">
                        {option}
                      </span>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 py-4">
        <div className="mx-auto max-w-lg">
          {currentStep < questions.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base"
            >
              Próxima
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext || isSubmitting}
              className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando seu perfil...
                </>
              ) : (
                'Descobrir Meu Protocolo'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
