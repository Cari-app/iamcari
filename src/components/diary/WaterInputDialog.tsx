import { useState } from 'react';
import { Droplet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Droplet className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Registrar Água</DialogTitle>
              <DialogDescription>Quanto você bebeu?</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
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
                    ? 'border-sky-500 bg-sky-500/20 text-sky-400'
                    : 'border-border bg-muted/30 text-foreground hover:border-sky-500/50'
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
                    ? 'border-sky-500 bg-sky-500/10'
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
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
              <span className="text-sky-400 font-semibold">
                {isCustom ? customAmount : selectedAmount}ml será adicionado
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 pt-0 gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="gradient-primary text-white"
          >
            <Droplet className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
