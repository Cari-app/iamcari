import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { quizQuestions, type QuizQuestion } from '@/lib/metabolicQuizQuestions';
import { generateMetabolicFastingPlan, type QuizAnswers } from '@/lib/metabolicFastingEngine';

// Total steps: welcome(0) + 12 questions(1-12) + processing(13)
const TOTAL_STEPS = 14;

export default function MetabolicQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0=welcome, 1-12=questions, 13=processing
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const currentQuestion: QuizQuestion | null = step >= 1 && step <= 12 ? quizQuestions[step - 1] : null;
  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  const selectAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const canContinue = step === 0 || (currentQuestion && answers[currentQuestion.id]);

  const goNext = useCallback(async () => {
    if (step < 12) {
      setStep(s => s + 1);
      return;
    }

    // step 12 → processing (step 13)
    if (step === 12) {
      setStep(13);
      setProcessing(true);

      try {
        const quizAnswers = answers as unknown as QuizAnswers;
        const result = generateMetabolicFastingPlan(quizAnswers);

        if (user) {
          // Save answers
          await supabase.from('fasting_onboarding_answers').insert({
            user_id: user.id,
            ...quizAnswers,
          });

          // Save result
          await supabase.from('fasting_plan_results').insert({
            user_id: user.id,
            profile_type: result.profile_type,
            profile_label: result.profile_label,
            plan_focus: result.plan_focus,
            recommended_protocol_hours: result.recommended_protocol_hours,
            schedule_start: result.schedule_start,
            schedule_end: result.schedule_end,
            schedule_label: result.schedule_label,
            weekly_goal_days: result.weekly_goal_days,
            progression_next_step: result.progression_next_step,
            behavior_alerts: result.behavior_alerts,
            reason_summary: result.reason_summary,
            support_style: result.support_style,
            plan_style: result.plan_style,
            dynamic_tags: result.dynamic_tags,
            active_plan: true,
          });

          // Update profile fasting_protocol
          await supabase.from('profiles').update({
            fasting_protocol: `${result.recommended_protocol_hours}_${24 - result.recommended_protocol_hours}`,
          }).eq('id', user.id);
        }

        // Simulate processing time for UX
        await new Promise(r => setTimeout(r, 2500));
        navigate('/metabolic-result');
      } catch (err) {
        console.error('Error saving metabolic quiz:', err);
        toast({ title: '❌ Erro ao salvar', description: 'Tente novamente.', variant: 'destructive' });
        setStep(12);
        setProcessing(false);
      }
    }
  }, [step, answers, user, navigate]);

  const goBack = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
    else navigate(-1);
  }, [step, navigate]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Progress bar */}
      {step > 0 && (
        <div className="px-4 pt-safe-top">
          <Progress value={progressPercent} className="h-1.5 mt-3" />
          <p className="text-xs text-muted-foreground mt-1.5 text-right tabular-nums">
            {Math.min(step, 12)}/12
          </p>
        </div>
      )}

      {/* Back button */}
      {step > 0 && step <= 12 && (
        <div className="px-4 pt-2">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-muted-foreground -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* ---- WELCOME ---- */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6 max-w-sm mx-auto"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                Vamos montar seu plano personalizado de jejum metabólico
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Responder essas perguntas ajuda o app a entender sua rotina, seu nível de adaptação e o melhor jeito de começar.
              </p>
              <Button onClick={() => setStep(1)} className="w-full h-14 rounded-2xl font-semibold text-base">
                Começar avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ---- QUESTIONS ---- */}
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-sm mx-auto w-full"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map(opt => {
                  const selected = answers[currentQuestion.id] === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => selectAnswer(currentQuestion.id, opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                        <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
                          {opt.label}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <Button
                onClick={goNext}
                disabled={!canContinue}
                className="w-full h-12 rounded-xl font-semibold"
              >
                {step === 12 ? 'Finalizar avaliação' : 'Continuar'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ---- PROCESSING ---- */}
          {step === 13 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-sm mx-auto"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Estamos montando seu plano ideal
              </h2>
              <p className="text-muted-foreground text-sm">
                Analisando sua rotina, seu nível de adaptação e o melhor jeito de começar.
              </p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
