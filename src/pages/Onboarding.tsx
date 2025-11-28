import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { Target, Heart, Scale } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    whatsapp: '',
    goal: '',
    currentWeight: '',
  });

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp: formData.whatsapp || null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Onboarding completed successfully');
      await refreshProfile();
      
      toast({
        title: '✅ Bem-vindo!',
        description: 'Seu perfil foi configurado com sucesso',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível completar o cadastro',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo!</h1>
          <p className="text-muted-foreground mt-2">
            Vamos configurar seu perfil
          </p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Qual seu objetivo?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Podemos ajudar você a alcançá-lo
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {['Perder peso', 'Manter peso', 'Ganhar massa'].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      setFormData({ ...formData, goal });
                      setStep(2);
                    }}
                    className="w-full p-4 rounded-xl border-2 border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left font-medium text-foreground"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Peso atual (opcional)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Nos ajuda a personalizar sua experiência
                  </p>
                </div>
              </div>

              <Input
                type="number"
                placeholder="Ex: 75"
                value={formData.currentWeight}
                onChange={(e) =>
                  setFormData({ ...formData, currentWeight: e.target.value })
                }
                className="bg-muted/50 border-border rounded-xl text-center text-lg"
              />

              <Button
                onClick={() => setStep(3)}
                className="w-full gradient-primary text-white"
              >
                Continuar
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep(3)}
                className="w-full"
              >
                Pular
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    WhatsApp (opcional)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Para receber lembretes e dicas
                  </p>
                </div>
              </div>

              <Input
                type="tel"
                placeholder="Ex: +55 11 99999-9999"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                className="bg-muted/50 border-border rounded-xl"
              />

              <Button
                onClick={handleSubmit}
                className="w-full gradient-primary text-white"
              >
                Começar a usar
              </Button>

              <Button
                variant="ghost"
                onClick={handleSubmit}
                className="w-full"
              >
                Pular
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
