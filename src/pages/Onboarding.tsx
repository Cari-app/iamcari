import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { User, Activity, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
type GoalType = 'lose_weight' | 'maintain' | 'gain_weight';
type GoalSpeed = 'slow' | 'moderate' | 'aggressive';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Biometrics
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState([170]);
  const [weight, setWeight] = useState([75]);

  // Step 2: Activity Level
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');

  // Step 3: Goals
  const [goalType, setGoalType] = useState<GoalType | ''>('');
  const [targetWeight, setTargetWeight] = useState('');
  const [goalSpeed, setGoalSpeed] = useState<GoalSpeed | ''>('');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Insert into assessments - DB trigger will calculate everything
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          gender,
          age: parseFloat(age),
          height_cm: height[0],
          weight_kg: weight[0],
          activity_level: activityLevel,
          goal_type: goalType,
          goal_speed: goalType === 'maintain' ? null : goalSpeed,
          target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
        });

      if (error) throw error;

      // Update profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Wait for DB trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await refreshProfile();

      toast({
        title: '✅ Avaliação Completa',
        description: 'Seu plano metabólico foi calculado com sucesso',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Assessment error:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível completar a avaliação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = gender && age && height[0] && weight[0];
  const canProceedStep2 = activityLevel;
  const canProceedStep3 = goalType && (goalType === 'maintain' || goalSpeed);

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
    { value: 'light', label: 'Levemente Ativo', desc: 'Exercício leve 1-3 dias/semana' },
    { value: 'moderate', label: 'Moderado', desc: 'Exercício moderado 3-5 dias/semana' },
    { value: 'active', label: 'Muito Ativo', desc: 'Exercício intenso 6-7 dias/semana' },
    { value: 'athlete', label: 'Atleta', desc: 'Exercício profissional ou diário intenso' },
  ];

  const goalOptions = [
    { value: 'lose_weight', label: 'Emagrecer', desc: 'Reduzir peso corporal', icon: '📉' },
    { value: 'maintain', label: 'Manter', desc: 'Manter peso atual', icon: '⚖️' },
    { value: 'gain_weight', label: 'Ganhar', desc: 'Aumentar massa muscular', icon: '📈' },
  ];

  const speedOptions = [
    { value: 'slow', label: 'Tranquilo', desc: '-10% das calorias' },
    { value: 'moderate', label: 'Moderado', desc: '-20% das calorias' },
    { value: 'aggressive', label: 'Rápido', desc: '-25% das calorias' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Avaliação Metabólica
          </h1>
          <p className="text-muted-foreground">
            Configure seu plano personalizado de saúde
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Etapa {step} de {totalSteps}
          </p>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Biometria */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Dados Biométricos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Informações básicas para cálculos metabólicos
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <Label className="text-foreground mb-3 block">Gênero</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setGender('male')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        gender === 'male'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card hover:border-muted'
                      }`}
                    >
                      <div className="text-3xl mb-2">👨</div>
                      <p className="font-medium">Masculino</p>
                    </button>
                    <button
                      onClick={() => setGender('female')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        gender === 'female'
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card hover:border-muted'
                      }`}
                    >
                      <div className="text-3xl mb-2">👩</div>
                      <p className="font-medium">Feminino</p>
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age" className="text-foreground">Idade (anos)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-2 text-lg"
                  />
                </div>

                {/* Height Slider */}
                <div>
                  <Label className="text-foreground flex justify-between items-center">
                    <span>Altura (cm)</span>
                    <span className="text-2xl font-bold text-primary">{height[0]}</span>
                  </Label>
                  <Slider
                    value={height}
                    onValueChange={setHeight}
                    min={100}
                    max={220}
                    step={1}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>100 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>

                {/* Weight Slider */}
                <div>
                  <Label className="text-foreground flex justify-between items-center">
                    <span>Peso (kg)</span>
                    <span className="text-2xl font-bold text-primary">{weight[0]}</span>
                  </Label>
                  <Slider
                    value={weight}
                    onValueChange={setWeight}
                    min={40}
                    max={180}
                    step={1}
                    className="mt-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>40 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>
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

          {/* STEP 2: Activity Level */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Estilo de Vida
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Qual seu nível de atividade física?
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setActivityLevel(option.value as ActivityLevel)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      activityLevel === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-muted'
                    }`}
                  >
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="text-muted-foreground"
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

          {/* STEP 3: Goals */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Objetivos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Defina sua estratégia de saúde
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Goal Type */}
                <div>
                  <Label className="text-foreground mb-3 block">Objetivo Principal</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {goalOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setGoalType(option.value as GoalType)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          goalType === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card hover:border-muted'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <p className="font-medium text-foreground text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Weight (Optional) */}
                <div>
                  <Label htmlFor="targetWeight" className="text-foreground">
                    Peso Alvo (kg) - Opcional
                  </Label>
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder="Ex: 70"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Goal Speed (Conditional) */}
                {goalType && goalType !== 'maintain' && (
                  <div>
                    <Label className="text-foreground mb-3 block">Velocidade</Label>
                    <div className="space-y-3">
                      {speedOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setGoalSpeed(option.value as GoalSpeed)}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            goalSpeed === option.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-muted'
                          }`}
                        >
                          <p className="font-medium text-foreground">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3 || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Calculando...' : 'Calcular Plano'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
