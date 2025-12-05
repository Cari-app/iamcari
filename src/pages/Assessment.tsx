import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, User, Activity, Target, Sparkles, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-cari.png';

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState<{
    bmr: number;
    tdee: number;
    target: number;
  } | null>(null);

  // Step 1: Dados Básicos
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<number>(25);
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);

  // Step 2: Estilo de Vida
  const [activityLevel, setActivityLevel] = useState<string>('');

  // Step 3: Objetivo & Velocidade
  const [goalType, setGoalType] = useState<string>('');
  const [goalSpeed, setGoalSpeed] = useState<string>('moderate');
  const [targetWeight, setTargetWeight] = useState<number>(0);

  const activityOptions = [
    { value: 'sedentary', label: 'Sedentário', desc: 'Trabalho sentado, pouco exercício' },
    { value: 'light', label: 'Levemente Ativo', desc: 'Treina 1-3x/semana' },
    { value: 'moderate', label: 'Moderado', desc: 'Treina 3-5x/semana' },
    { value: 'active', label: 'Muito Ativo', desc: 'Treina 6-7x/semana' },
    { value: 'athlete', label: 'Atleta', desc: '2x por dia / Trabalho físico' },
  ];

  const goalOptions = [
    { value: 'lose_weight', label: 'Emagrecer', icon: '🔥' },
    { value: 'maintain', label: 'Manter', icon: '⚖️' },
    { value: 'gain_weight', label: 'Ganhar', icon: '💪' },
  ];

  const speedOptions = [
    { value: 'slow', label: 'Tranquilo', desc: '-10% / +10%' },
    { value: 'moderate', label: 'Moderado', desc: '-20% / +15%' },
    { value: 'aggressive', label: 'Rápido', desc: '-25% / +20%' },
  ];

  const canProceedStep1 = gender && age >= 10 && height >= 100 && weight >= 40;
  const canProceedStep2 = activityLevel;
  const canProceedStep3 = goalType;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!canProceedStep3) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Insert assessment data
      const { error } = await supabase.from('assessments').insert({
        user_id: user.id,
        gender,
        age,
        height_cm: height,
        weight_kg: weight,
        activity_level: activityLevel,
        goal_type: goalType,
        goal_speed: goalType === 'maintain' ? null : goalSpeed,
        target_weight_kg: targetWeight > 0 ? targetWeight : null,
      });

      if (error) throw error;

      // Wait minimum 1.5s for loading UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Retry logic: Poll for updated profile data
      let retries = 0;
      const maxRetries = 5;
      let profileData = null;

      while (retries < maxRetries) {
        await refreshProfile();
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('daily_calories_target')
          .eq('id', user.id)
          .single();

        if (profile?.daily_calories_target && profile.daily_calories_target > 0) {
          profileData = profile;
          break;
        }

        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // Fetch calculated BMR and TDEE from assessments
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('bmr, tdee')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (profileData && assessmentData) {
        setCalculatedData({
          bmr: Math.round(assessmentData.bmr || 0),
          tdee: Math.round(assessmentData.tdee || 0),
          target: Math.round(profileData.daily_calories_target || 0),
        });
        setStep(4); // Move to result step
      } else {
        throw new Error('Não foi possível calcular o plano');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar avaliação',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] pb-8 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-8" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => step === 1 ? navigate('/dashboard') : handleBack()}
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
              <span className="text-sm font-medium text-white/80">Avaliação Metabólica</span>
              <span className="text-sm font-medium text-white/60">
                Passo {step}/3
              </span>
            </div>
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>

          {/* Content */}
          <main className="px-4 pt-4">
            <AnimatePresence mode="wait">
          {/* RESULT STEP (Step 4) */}
          {step === 4 && calculatedData && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 py-8"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-primary" />
                </div>
              </motion.div>

              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Plano Calculado! 🎉</h2>
                <p className="text-muted-foreground">
                  A I.A. analisou seu perfil metabólico
                </p>
              </div>

              {/* Results Cards */}
              <div className="space-y-3 pt-4">
                <Card className="p-6 border-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <Activity className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Metabolismo Basal (BMR)</p>
                      <p className="text-2xl font-bold">{calculatedData.bmr} kcal</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Gasto Total Diário (TDEE)</p>
                      <p className="text-2xl font-bold">{calculatedData.tdee} kcal</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2 border-primary bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Flame className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">🎯 Sua Meta Diária</p>
                      <p className="text-3xl font-bold text-primary">{calculatedData.target} kcal</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="w-full h-14 text-base font-semibold mt-8"
              >
                Começar Jornada
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Dados Básicos</h2>
                  <p className="text-sm text-muted-foreground">Informações sobre seu corpo</p>
                </div>
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map((g) => (
                    <Card
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        'p-6 cursor-pointer transition-all active:scale-95 border-2',
                        gender === g
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{g === 'male' ? '👨' : '👩'}</div>
                        <div className="font-semibold">{g === 'male' ? 'Masculino' : 'Feminino'}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Idade */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Idade</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="h-14 text-lg"
                  min={10}
                  max={100}
                />
              </div>

              {/* Altura */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Altura (cm)</label>
                  <span className="text-2xl font-bold tabular-nums text-primary">{height}</span>
                </div>
                <Slider
                  value={[height]}
                  onValueChange={(v) => setHeight(v[0])}
                  min={100}
                  max={250}
                  step={1}
                  className="py-4"
                />
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="h-12"
                  min={100}
                  max={250}
                />
              </div>

              {/* Peso */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Peso (kg)</label>
                  <span className="text-2xl font-bold tabular-nums text-primary">{weight}</span>
                </div>
                <Slider
                  value={[weight]}
                  onValueChange={(v) => setWeight(v[0])}
                  min={40}
                  max={150}
                  step={0.1}
                  className="py-4"
                />
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="h-12"
                  step={0.1}
                  min={40}
                  max={150}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Estilo de Vida</h2>
                  <p className="text-sm text-muted-foreground">Nível de atividade física</p>
                </div>
              </div>

              <div className="space-y-3">
                {activityOptions.map((option) => (
                  <Card
                    key={option.value}
                    onClick={() => setActivityLevel(option.value)}
                    className={cn(
                      'p-5 cursor-pointer transition-all active:scale-95 border-2',
                      activityLevel === option.value
                        ? 'border-secondary bg-secondary/5'
                        : 'border-border hover:border-secondary/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                          activityLevel === option.value ? 'border-secondary' : 'border-muted-foreground'
                        )}
                      >
                        {activityLevel === option.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{option.desc}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Objetivo</h2>
                  <p className="text-sm text-muted-foreground">O que você deseja alcançar?</p>
                </div>
              </div>

              {/* Objetivo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Seu objetivo</label>
                <div className="grid grid-cols-3 gap-3">
                  {goalOptions.map((option) => (
                    <Card
                      key={option.value}
                      onClick={() => setGoalType(option.value)}
                      className={cn(
                        'p-5 cursor-pointer transition-all active:scale-95 border-2',
                        goalType === option.value
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50'
                      )}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-sm">{option.label}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Velocidade (Conditional) */}
              {goalType && goalType !== 'maintain' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium">Velocidade do progresso</label>
                  <div className="space-y-2">
                    {speedOptions.map((option) => (
                      <Card
                        key={option.value}
                        onClick={() => setGoalSpeed(option.value)}
                        className={cn(
                          'p-4 cursor-pointer transition-all active:scale-95 border-2',
                          goalSpeed === option.value
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                              goalSpeed === option.value ? 'border-accent' : 'border-muted-foreground'
                            )}
                          >
                            {goalSpeed === option.value && (
                              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Peso Alvo (Opcional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Peso Alvo (opcional)</label>
                <Input
                  type="number"
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  placeholder="Ex: 75"
                  className="h-12"
                  step={0.1}
                  min={40}
                  max={150}
                />
                <p className="text-xs text-muted-foreground">Deixe em branco se não tiver meta específica</p>
              </div>
            </motion.div>
          )}
            </AnimatePresence>

            {/* Footer Actions */}
            {step < 4 && (
              <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border">
                <div className="max-w-2xl mx-auto px-4 py-4">
                  {step < 3 ? (
                    <Button
                      size="lg"
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !canProceedStep1) ||
                        (step === 2 && !canProceedStep2)
                      }
                      className="w-full h-14 text-base font-semibold"
                    >
                      Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleComplete}
                      disabled={!canProceedStep3 || loading}
                      className="w-full h-14 text-base font-semibold"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          A I.A. está calculando...
                        </span>
                      ) : (
                        'Calcular Plano'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
