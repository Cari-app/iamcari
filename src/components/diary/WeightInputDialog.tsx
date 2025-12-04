import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

interface WeightInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (weight: number) => void;
  lastWeight?: number;
}

export function WeightInputDialog({
  open,
  onOpenChange,
  onSubmit,
  lastWeight = 70,
}: WeightInputDialogProps) {
  const [weight, setWeight] = useState(lastWeight.toString());

  useEffect(() => {
    if (open) {
      setWeight(lastWeight.toString());
    }
  }, [open, lastWeight]);

  const handleSubmit = () => {
    const numWeight = parseFloat(weight);
    if (!isNaN(numWeight) && numWeight > 0 && numWeight < 500) {
      onSubmit(numWeight);
      onOpenChange(false);
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || lastWeight;
    const newWeight = Math.max(20, Math.min(300, current + delta));
    setWeight(newWeight.toFixed(1));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-transparent border-none">
        <div className="mx-auto w-full max-w-lg bg-card border border-border rounded-t-3xl">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                <Scale className="h-5 w-5 text-[#84cc16]" />
              </div>
              <div>
                <DrawerTitle className="text-foreground">Registrar Peso</DrawerTitle>
                <DrawerDescription>Informe seu peso atual</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustWeight(-0.5)}
                className="h-12 w-12 rounded-xl text-lg font-bold"
              >
                -
              </Button>
              
              <div className="relative">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-32 h-16 text-center text-3xl font-bold tabular-nums bg-muted/50 border-border rounded-xl"
                  step="0.1"
                  min="20"
                  max="300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustWeight(0.5)}
                className="h-12 w-12 rounded-xl text-lg font-bold"
              >
                +
              </Button>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button onClick={handleSubmit} className="w-full bg-[#84cc16] hover:bg-[#84cc16]/90 text-white">
              Salvar
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
