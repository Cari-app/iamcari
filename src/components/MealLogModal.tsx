import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Pencil, Heart, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'hunger-check' | 'breathing' | 'log-type';

export function MealLogModal({ isOpen, onClose }: MealLogModalProps) {
  const [step, setStep] = useState<Step>('hunger-check');
  const [hungerLevel, setHungerLevel] = useState(5);
  const [breathingTime, setBreathingTime] = useState(60);

  const isEmotionalHunger = hungerLevel > 5;

  const handleHungerSubmit = () => {
    if (isEmotionalHunger) {
      setStep('breathing');
    } else {
      setStep('log-type');
    }
  };

  const handleBreathingComplete = () => {
    setStep('log-type');
  };

  const handleClose = () => {
    setStep('hunger-check');
    setHungerLevel(5);
    setBreathingTime(60);
    onClose();
  };

  // Countdown effect for breathing
  useState(() => {
    if (step === 'breathing' && breathingTime > 0) {
      const timer = setInterval(() => {
        setBreathingTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="mx-4 mb-4 rounded-3xl bg-card border border-border shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  {step === 'hunger-check' && 'Check-in de Fome'}
                  {step === 'breathing' && 'Micro-pausa de Respiração'}
                  {step === 'log-type' && 'Registrar Refeição'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {step === 'hunger-check' && (
                    <motion.div
                      key="hunger"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <p className="text-muted-foreground mb-2">
                          Em uma escala de 1 a 10, quão emocional é sua fome agora?
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          1 = Fome física real | 10 = Totalmente emocional
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Slider
                          value={[hungerLevel]}
                          onValueChange={([value]) => setHungerLevel(value)}
                          min={1}
                          max={10}
                          step={1}
                          className="py-4"
                        />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-secondary flex items-center gap-1">
                            <span>🍎</span> Física
                          </span>
                          <span className={cn(
                            "text-4xl font-bold tabular-nums transition-colors",
                            isEmotionalHunger ? "text-destructive" : "text-secondary"
                          )}>
                            {hungerLevel}
                          </span>
                          <span className="text-sm text-destructive flex items-center gap-1">
                            Emocional <Heart className="h-4 w-4" />
                          </span>
                        </div>
                      </div>

                      {isEmotionalHunger && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20"
                        >
                          <p className="text-sm text-destructive text-center">
                            Detectamos fome emocional. Vamos fazer uma pausa de respiração primeiro? 💜
                          </p>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleHungerSubmit}
                        className="w-full h-12 rounded-2xl gradient-primary text-white font-medium press-effect"
                      >
                        {isEmotionalHunger ? 'Iniciar Respiração' : 'Continuar'}
                      </Button>
                    </motion.div>
                  )}

                  {step === 'breathing' && (
                    <motion.div
                      key="breathing"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 text-center"
                    >
                      <div className="relative mx-auto w-32 h-32">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <Wind className="h-12 w-12 text-primary animate-pulse-soft" />
                        </motion.div>
                      </div>

                      <div>
                        <p className="text-2xl font-semibold text-foreground mb-2">
                          Respire fundo...
                        </p>
                        <p className="text-muted-foreground">
                          4 segundos inspirar, 4 segundos segurar, 4 segundos expirar
                        </p>
                      </div>

                      <div className="text-5xl font-bold tabular-nums text-primary">
                        {Math.floor(breathingTime / 60)}:{(breathingTime % 60).toString().padStart(2, '0')}
                      </div>

                      <Button
                        onClick={handleBreathingComplete}
                        variant="outline"
                        className="w-full h-12 rounded-2xl press-effect"
                      >
                        {breathingTime === 0 ? 'Continuar' : 'Pular pausa'}
                      </Button>
                    </motion.div>
                  )}

                  {step === 'log-type' && (
                    <motion.div
                      key="log-type"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <p className="text-center text-muted-foreground mb-6">
                        Como deseja registrar sua refeição?
                      </p>

                      <Button
                        variant="outline"
                        className="w-full h-16 rounded-2xl justify-start gap-4 press-effect border-primary/30 hover:border-primary hover:bg-primary/5"
                      >
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">Foto com IA</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span className="text-primary">💎</span> 1 Token
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full h-16 rounded-2xl justify-start gap-4 press-effect"
                      >
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Pencil className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-foreground">Texto Manual</p>
                          <p className="text-sm text-muted-foreground">Grátis</p>
                        </div>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
