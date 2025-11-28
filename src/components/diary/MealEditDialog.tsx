import { useState, useEffect } from 'react';
import { Pencil, Heart, Star } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MealEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { 
    food_name: string;
    calories: number;
    is_emotional: boolean;
  }) => void;
  initialData: {
    food_name: string;
    calories?: number;
    is_emotional?: boolean;
  };
}

export function MealEditDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: MealEditDialogProps) {
  const [foodName, setFoodName] = useState(initialData.food_name);
  const [calories, setCalories] = useState(initialData.calories?.toString() || '');
  const [isEmotional, setIsEmotional] = useState(initialData.is_emotional || false);

  useEffect(() => {
    if (open) {
      setFoodName(initialData.food_name);
      setCalories(initialData.calories?.toString() || '');
      setIsEmotional(initialData.is_emotional || false);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!foodName.trim()) {
      return;
    }

    const parsedCalories = parseInt(calories) || 0;

    onSubmit({
      food_name: foodName,
      calories: parsedCalories,
      is_emotional: isEmotional,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Pencil className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Editar Refeição</DialogTitle>
              <DialogDescription>
                Atualize os dados da refeição
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="food_name" className="text-foreground">
              Nome da Refeição
            </Label>
            <Input
              id="food_name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Ex: Arroz, feijão e carne"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories" className="text-foreground">
              Calorias (opcional)
            </Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Ex: 450"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tipo de Refeição</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEmotional(false)}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border transition-all',
                  !isEmotional
                    ? 'bg-secondary/20 border-secondary text-secondary'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Star className={cn('h-4 w-4', !isEmotional && 'fill-secondary')} />
                  <span className="font-medium">Planejada</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setIsEmotional(true)}
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border transition-all',
                  isEmotional
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-background border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">Emocional</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!foodName.trim()}
            className="w-full sm:w-auto gradient-primary text-white"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
