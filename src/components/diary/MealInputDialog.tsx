import { useState, useRef } from 'react';
import { Camera, Pencil, Utensils, Sparkles, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
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
  onPhotoSubmitted?: () => void; // Callback para refetch após foto ser enviada
}

type InputMethod = 'select' | 'camera' | 'manual';

export function MealInputDialog({
  open,
  onOpenChange,
  onSubmit,
  onPhotoSubmitted,
}: MealInputDialogProps) {
  const { user } = useAuth();
  const [method, setMethod] = useState<InputMethod>('select');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [isEmotional, setIsEmotional] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setMethod('select');
    setDescription('');
    setCalories('');
    setIsEmotional(false);
    setSelectedImage(null);
    setImagePreview(null);
    setUploading(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraSubmit = async () => {
    if (!user || !selectedImage) {
      toast({
        title: '❌ Erro',
        description: 'Selecione uma imagem primeiro',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload to Supabase Storage
      const timestamp = Date.now();
      const fileExt = selectedImage.name.split('.').pop();
      const filePath = `${user.id}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('meal_photos')
        .upload(filePath, selectedImage);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Step 2: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meal_photos')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', publicUrl);

      // Step 3: Insert initial record into meal_logs with status 'pending'
      const { error: insertError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          entry_type: 'meal',
          image_url: publicUrl,
          status: 'pending',
          food_name: 'Aguardando análise de imagem...',
          is_emotional: isEmotional,
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      // Success!
      toast({
        title: '📸 Foto enviada com sucesso!',
        description: 'Aguarde a análise da Dona.',
      });

      // Trigger refetch in parent component
      if (onPhotoSubmitted) {
        onPhotoSubmitted();
      }

      handleClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: '❌ Erro no envio',
        description: 'Não foi possível enviar a foto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
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
    <>
      {/* Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full gradient-primary animate-spin border-4 border-transparent border-t-white" />
            <p className="text-white text-lg font-medium">Processando imagem...</p>
          </div>
        </div>
      )}

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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-violet-500/50 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-violet-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Toque para tirar foto</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        A IA analisará automaticamente
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0" />
                <p className="text-xs text-violet-300">
                  Esta funcionalidade consome tokens de IA
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1" disabled={uploading}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleCameraSubmit} 
                  disabled={!selectedImage || uploading}
                  className="flex-1 gradient-primary text-white"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Capturar'}
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
    </>
  );
}
