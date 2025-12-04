import { useState } from 'react';
import { Droplet } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface WaterInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amount: number) => void;
}

const QUICK_OPTIONS = [
  { label: '150ml', value: 150 },
  { label: '250ml', value: 250 },
  { label: '500ml', value: 500 },
  { label: '1L', value: 1000 },
];

export function WaterInputDialog({
  open,
  onOpenChange,
  onSubmit,
}: WaterInputDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleQuickSelect = (value: number) => {
    setSelectedAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleSubmit = () => {
    const amount = isCustom ? parseInt(customAmount) : selectedAmount;
    if (amount && amount > 0 && amount <= 5000) {
      onSubmit(amount);
      onOpenChange(false);
      // Reset state
      setSelectedAmount(250);
      setCustomAmount('');
      setIsCustom(false);
    }
  };

  const isValid = isCustom 
    ? parseInt(customAmount) > 0 && parseInt(customAmount) <= 5000
    : selectedAmount !== null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-transparent border-none">
        <div className="mx-auto w-full max-w-lg bg-card border border-border rounded-t-3xl">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                <Droplet className="h-5 w-5 text-[#84cc16]" />
              </div>
              <div>
                <DrawerTitle className="text-foreground">Registrar Água</DrawerTitle>
                <DrawerDescription>Quanto você bebeu?</DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4">
            {/* Quick Options */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleQuickSelect(option.value)}
                  className={cn(
                    'py-3 rounded-xl text-sm font-semibold transition-all',
                    'border-2',
                    selectedAmount === option.value && !isCustom
                      ? 'border-[#84cc16] bg-[#84cc16]/20 text-[#84cc16]'
                      : 'border-border bg-muted/30 text-foreground hover:border-[#84cc16]/50'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Ou digite uma quantidade personalizada
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="Ex: 350"
                  className={cn(
                    'pr-12 bg-muted/50 border-2 rounded-xl text-center text-lg font-semibold tabular-nums transition-colors',
                    isCustom && customAmount
                      ? 'border-[#84cc16] bg-[#84cc16]/10'
                      : 'border-border'
                  )}
                  min="1"
                  max="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ml
                </span>
              </div>
            </div>

            {/* Selected Display */}
            {(selectedAmount || (isCustom && customAmount)) && (
              <div className="p-3 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 text-center">
                <span className="text-[#84cc16] font-semibold">
                  {isCustom ? customAmount : selectedAmount}ml será adicionado
                </span>
              </div>
            )}
          </div>

          <DrawerFooter className="pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid}
              className="w-full bg-[#84cc16] hover:bg-[#84cc16]/90 text-white"
            >
              <Droplet className="h-4 w-4 mr-2" />
              Adicionar
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
