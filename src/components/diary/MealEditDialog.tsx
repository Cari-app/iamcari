import { useState, useEffect } from 'react';
import { Pencil, Heart, Star } from 'lucide-react';
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-transparent border-none">
        <div className="mx-auto w-full max-w-lg bg-card border border-border rounded-t-3xl">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-[#84cc16]" />
              </div>
              <div>
                <DrawerTitle className="text-foreground">Editar Refeição</DrawerTitle>
                <DrawerDescription>
                  Atualize os dados da refeição
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food_name" className="text-foreground">
                Nome da Refeição
              </Label>
              <Input
                id="food_name"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Ex: Arroz, feijão e carne"
                className="bg-muted/50 border-border rounded-xl"
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
                className="bg-muted/50 border-border rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Tipo de Refeição</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmotional(false)}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl border-2 transition-all',
                    !isEmotional
                      ? 'bg-[#84cc16]/20 border-[#84cc16] text-[#84cc16]'
                      : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Star className={cn('h-4 w-4', !isEmotional && 'fill-[#84cc16]')} />
                    <span className="font-medium">Planejada</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsEmotional(true)}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl border-2 transition-all',
                    isEmotional
                      ? 'bg-[#84cc16]/20 border-[#84cc16] text-[#84cc16]'
                      : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Heart className={cn('h-4 w-4', isEmotional && 'fill-[#84cc16]')} />
                    <span className="font-medium">Emocional</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!foodName.trim()}
              className="w-full bg-[#84cc16] hover:bg-[#84cc16]/90 text-white"
            >
              Salvar Alterações
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
