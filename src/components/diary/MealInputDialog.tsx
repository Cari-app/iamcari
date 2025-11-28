import { useState } from 'react';
import { Camera, Pencil, Utensils, Sparkles, Heart, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MealInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    method: 'ai' | 'manual';
    description: string;
    calories?: number;
    imageUrl?: string;
    isEmotional?: boolean;
  }) => void;
}

type InputMethod = 'select' | 'camera' | 'manual';

export function MealInputDialog({
  open,
  onOpenChange,
  onSubmit,
}: MealInputDialogProps) {
  const [method, setMethod] = useState<InputMethod>('select');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [isEmotional, setIsEmotional] = useState(false);

  const resetState = () => {
    setMethod('select');
    setDescription('');
    setCalories('');
    setIsEmotional(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleCameraSubmit = () => {
    // In a real implementation, this would open the camera
    // For now, simulate AI analysis
    onSubmit({
      method: 'ai',
      description: 'Refeição analisada por IA',
      calories: 0, // Would be filled by AI
      isEmotional,
    });
    handleClose();
  };

  const handleManualSubmit = () => {
    const numCalories = parseInt(calories) || 0;
    if (description.trim() && numCalories > 0) {
      onSubmit({
        method: 'manual',
        description: description.trim(),
        calories: numCalories,
        isEmotional,
      });
      handleClose();
    }
  };

  const handleBack = () => {
    setMethod('select');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[340px] bg-card border-border p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Adicionar Refeição</DialogTitle>
              <DialogDescription>
                {method === 'select' && 'Escolha como registrar'}
                {method === 'camera' && 'Tire uma foto da refeição'}
                {method === 'manual' && 'Descreva sua refeição'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          {/* Method Selection */}
          {method === 'select' && (
            <div className="space-y-3">
              {/* AI Camera Option */}
              <button
                onClick={() => setMethod('camera')}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 border-dashed transition-all',
                  'border-violet-500/30 bg-violet-500/5',
                  'hover:border-violet-500/50 hover:bg-violet-500/10',
                  'active:scale-[0.98]'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Tirar Foto</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Análise automática de calorias
                    </p>
                  </div>
                </div>
              </button>

              {/* Manual Option */}
              <button
                onClick={() => setMethod('manual')}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 border-dashed transition-all',
                  'border-border bg-muted/30',
                  'hover:border-muted-foreground/30 hover:bg-muted/50',
                  'active:scale-[0.98]'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-foreground">Entrada Manual</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Descreva e informe as calorias
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Camera Mode */}
          {method === 'camera' && (
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3">
                <div className="h-16 w-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-violet-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Toque para tirar foto</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A IA analisará automaticamente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0" />
                <p className="text-xs text-violet-300">
                  Esta funcionalidade consome tokens de IA
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleCameraSubmit} className="flex-1 gradient-primary text-white">
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar
                </Button>
              </div>
            </div>
          )}

          {/* Manual Mode */}
          {method === 'manual' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Descrição da refeição
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Arroz, feijão e frango grelhado"
                  className="min-h-[80px] bg-muted/50 border-border rounded-xl resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Calorias (kcal)
                </label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Ex: 450"
                  className="bg-muted/50 border-border rounded-xl text-center text-lg font-semibold tabular-nums"
                  min="0"
                  max="5000"
                />
              </div>

              {/* Emotional Toggle */}
              <button
                type="button"
                onClick={() => setIsEmotional(!isEmotional)}
                className={cn(
                  'w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3',
                  isEmotional
                    ? 'border-rose-500/50 bg-rose-500/10'
                    : 'border-secondary/50 bg-secondary/10'
                )}
              >
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                  isEmotional ? 'bg-rose-500/20' : 'bg-secondary/20'
                )}>
                  {isEmotional ? (
                    <Heart className="h-5 w-5 text-rose-400 fill-rose-400 transition-colors" />
                  ) : (
                    <Star className="h-5 w-5 text-secondary fill-secondary transition-colors" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className={cn(
                    'font-medium transition-colors',
                    isEmotional ? 'text-rose-400' : 'text-secondary'
                  )}>
                    {isEmotional ? 'Refeição emocional' : 'Refeição Planejada'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Marque se essa refeição não faz parte do plano de dieta
                  </p>
                </div>
              </button>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleManualSubmit} 
                  disabled={!description.trim() || !calories}
                  className="flex-1 gradient-primary text-white"
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
