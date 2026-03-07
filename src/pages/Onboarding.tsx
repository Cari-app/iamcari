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
import { User, ChevronRight, ChevronLeft, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Gender = 'male' | 'female';

const FASTING_PROTOCOLS = [
  { value: '16:8', label: '16:8', desc: '16h de jejum, 8h de alimentação', icon: '⏱️' },
  { value: '18:6', label: '18:6', desc: '18h de jejum, 6h de alimentação', icon: '🔥' },
  { value: '20:4', label: '20:4', desc: '20h de jejum, 4h de alimentação', icon: '💪' },
  { value: 'OMAD', label: 'OMAD', desc: 'Uma refeição por dia (23:1)', icon: '🏆' },
];

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

  // Step 2: Fasting Protocol
  const [fastingProtocol, setFastingProtocol] = useState('');

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Update profile with biometrics and fasting protocol
      const { error } = await supabase
        .from('profiles')
        .update({
          gender,
          age: parseFloat(age),
          height: height[0],
          weight: weight[0],
          fasting_protocol: fastingProtocol,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: '✅ Tudo pronto!',
        description: 'Seu perfil de jejum foi configurado',
      });

      navigate('/fasting');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível completar o cadastro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = gender && age && height[0] && weight[0];
  const canProceedStep2 = fastingProtocol;

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden"
      style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
    >
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
            Configure seu Jejum
          </h1>
          <p className="text-muted-foreground">
            Vamos personalizar sua experiência
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
                  <h2 className="text-xl font-semibold text-foreground">Dados Básicos</h2>
                  <p className="text-sm text-muted-foreground">Informações sobre você</p>
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
                  <Slider value={height} onValueChange={setHeight} min={100} max={220} step={1} className="mt-4" />
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
                  <Slider value={weight} onValueChange={setWeight} min={40} max={180} step={1} className="mt-4" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>40 kg</span>
                    <span>180 kg</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1} className="bg-primary hover:bg-primary/90">
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Fasting Protocol */}
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
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Protocolo de Jejum</h2>
                  <p className="text-sm text-muted-foreground">Escolha seu protocolo inicial</p>
                </div>
              </div>

              <div className="space-y-3">
                {FASTING_PROTOCOLS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFastingProtocol(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      fastingProtocol === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(1)} variant="ghost" className="text-muted-foreground">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep2 || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? 'Salvando...' : 'Começar'} 
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
