import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Zap } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { EMOTION_TAGS, EmotionTag } from '@/types';

interface MoodCheckInDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { energyLevel: number; emotion: EmotionTag }) => void;
}

export function MoodCheckInDrawer({
  open,
  onOpenChange,
  onSubmit,
}: MoodCheckInDrawerProps) {
  const [energyLevel, setEnergyLevel] = useState(5);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTag | null>(null);

  const handleSubmit = () => {
    if (selectedEmotion) {
      onSubmit({ energyLevel, emotion: selectedEmotion });
      setEnergyLevel(5);
      setSelectedEmotion(null);
      onOpenChange(false);
    }
  };

  const getEnergyLabel = (level: number) => {
    if (level <= 2) return 'Muito baixa';
    if (level <= 4) return 'Baixa';
    if (level <= 6) return 'Moderada';
    if (level <= 8) return 'Alta';
    return 'Muito alta';
  };

  const getEnergyColor = (level: number) => {
    if (level <= 2) return 'text-rose-400';
    if (level <= 4) return 'text-orange-400';
    if (level <= 6) return 'text-amber-400';
    if (level <= 8) return 'text-emerald-400';
    return 'text-violet-400';
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <DrawerTitle className="text-foreground">Check-in Mental</DrawerTitle>
                <DrawerDescription>Como você está se sentindo agora?</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-6">
            {/* Energy Level Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">
                    Nível de Energia
                  </span>
                </div>
                <span className={cn('text-sm font-bold tabular-nums', getEnergyColor(energyLevel))}>
                  {energyLevel}/10 - {getEnergyLabel(energyLevel)}
                </span>
              </div>
              <Slider
                value={[energyLevel]}
                onValueChange={(value) => setEnergyLevel(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Emotion Tags */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground">
                Como você se sente?
              </span>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((emotion) => (
                  <motion.button
                    key={emotion.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                      selectedEmotion === emotion.value
                        ? emotion.color
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                    )}
                  >
                    {emotion.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!selectedEmotion}
              className="w-full gradient-primary text-white"
            >
              Registrar Check-in
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
