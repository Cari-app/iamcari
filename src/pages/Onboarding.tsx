import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { Target, User, Activity, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Goal = 'Perder Peso' | 'Ganhar Energia' | 'Longevidade';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense';
type Protocol = '12h' | '16h' | '20h';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [goal, setGoal] = useState<Goal | ''>('');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentary');
  const [protocol, setProtocol] = useState<Protocol>('16h');

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // First, update profile with basic info and mark onboarding complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseFloat(age),
          gender,
          activity_level: activityLevel,
          fasting_protocol: protocol,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create assessment - DB trigger will calculate BMR/TDEE and update profile.daily_calories_target
      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          gender,
          age: parseFloat(age),
          height_cm: parseFloat(height),
          weight_kg: parseFloat(weight),
          activity_level: activityLevel,
          goal_type: 'maintain', // Default goal
          goal_speed: null,
          target_weight_kg: null,
        });

      if (assessmentError) throw assessmentError;

      // Wait a bit for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await refreshProfile();

      toast({
        title: '✅ Perfil Configurado',
        description: `Protocolo: ${protocol} | Avaliação metabólica concluída`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível completar a configuração',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = goal !== '';
  const canProceedStep2 = gender && age && weight && height;
  const canProceedStep3 = activityLevel;
  const canProceedStep4 = protocol;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Avaliação Metabólica
          </h1>
          <p className="text-slate-400">
            Vamos personalizar sua jornada de saúde
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-400 mt-2 text-center">
            Etapa {step} de {totalSteps}
          </p>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Goal */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Qual seu objetivo principal?
                  </h2>
                  <p className="text-sm text-slate-400">
                    Isso nos ajuda a personalizar sua experiência
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(['Perder Peso', 'Ganhar Energia', 'Longevidade'] as Goal[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium ${
                      goal === g
                        ? 'border-primary bg-primary/10 text-slate-50'
                        : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Biometrics */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Dados Biométricos
                  </h2>
                  <p className="text-sm text-slate-400">
                    Para calcular suas metas metabólicas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Gênero</Label>
                  <RadioGroup value={gender} onValueChange={(v) => setGender(v as Gender)}>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="text-slate-300 cursor-pointer">
                          Masculino
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="text-slate-300 cursor-pointer">
                          Feminino
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="age" className="text-slate-300">Idade (anos)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-slate-50 mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight" className="text-slate-300">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Ex: 75"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-50 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-slate-300">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Ex: 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-slate-50 mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="text-slate-400"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Activity Level */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Nível de Atividade
                  </h2>
                  <p className="text-sm text-slate-400">
                    Qual seu nível de atividade física?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
                  { value: 'light', label: 'Leve', desc: '1-3 dias/semana' },
                  { value: 'moderate', label: 'Moderado', desc: '3-5 dias/semana' },
                  { value: 'intense', label: 'Intenso', desc: '6-7 dias/semana' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setActivityLevel(option.value as ActivityLevel)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      activityLevel === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-slate-50">{option.label}</p>
                    <p className="text-sm text-slate-400">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="text-slate-400"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Protocol */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 rounded-2xl p-8 border border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">
                    Protocolo de Jejum
                  </h2>
                  <p className="text-sm text-slate-400">
                    Escolha o protocolo ideal para você
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { value: '12h', label: 'Iniciante (12h)', desc: 'Ideal para começar' },
                  { value: '16h', label: 'Intermediário (16h)', desc: 'Protocolo mais popular' },
                  { value: '20h', label: 'Guerreiro (20h)', desc: 'Para experientes' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProtocol(option.value as Protocol)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      protocol === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-slate-50">{option.label}</p>
                    <p className="text-sm text-slate-400">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setStep(3)}
                  variant="ghost"
                  className="text-slate-400"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!canProceedStep4 || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Processando...' : 'Concluir'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
