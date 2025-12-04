import { useState, useRef, useEffect } from 'react';
import { Camera, Pencil, Utensils, Sparkles, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
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
  onPhotoSubmitted?: () => void;
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
  const [uploadStep, setUploadStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadSteps = [
    'Comprimindo imagem...',
    'Enviando para a nuvem...',
    'Salvando registro...',
  ];

  // Cycle through upload steps
  useEffect(() => {
    if (!uploading) return;
    
    const interval = setInterval(() => {
      setUploadStep((prev) => (prev + 1) % uploadSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [uploading]);

  const resetState = () => {
    setMethod('select');
    setDescription('');
    setCalories('');
    setIsEmotional(false);
    setSelectedImage(null);
    setImagePreview(null);
    setUploading(false);
    setUploadStep(0);
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
    setUploadStep(0);

    try {
      // Step 1: Compress image
      const compressedBlob = await compressImage(selectedImage);

      // Step 2: Upload to storage
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('meal_photos')
        .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('meal_photos')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Step 3: Create meal log entry
      const { error: insertError } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          is_emotional: isEmotional,
          status: 'pending',
          entry_type: 'meal',
        });

      if (insertError) throw insertError;

      toast({
        title: '✅ Foto enviada!',
        description: 'Sua refeição foi registrada com sucesso.',
      });

      if (onPhotoSubmitted) {
        onPhotoSubmitted();
      }

      handleClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: '❌ Erro no envio',
        description: 'Não foi possível enviar a foto.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadStep(0);
    }
  };

  const handleManualSubmit = async () => {
    if (!user) return;
    
    const numCalories = parseInt(calories) || 0;
    if (!description.trim() || numCalories <= 0) {
      toast({
        title: '❌ Dados incompletos',
        description: 'Preencha a descrição e as calorias',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: user.id,
          food_name: description.trim(),
          calories: numCalories,
          is_emotional: isEmotional,
          status: 'manual',
          entry_type: 'meal',
        });

      if (error) throw error;

      toast({
        title: '✅ Refeição registrada!',
        description: `${description} - ${numCalories} kcal`,
      });

      onSubmit({
        method: 'manual',
        description: description.trim(),
        calories: numCalories,
        isEmotional,
      });
      handleClose();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível registrar a refeição',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    setMethod('select');
  };

  return (
    <>
      {/* Loading Overlay with Stepped Progress */}
      {uploading && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="text-center space-y-6 px-6">
            <div className="relative">
              <div className="h-20 w-20 mx-auto rounded-full gradient-primary animate-spin border-4 border-transparent border-t-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-white text-xl font-semibold animate-pulse">
                {uploadSteps[uploadStep]}
              </p>
              <div className="flex gap-1.5 justify-center">
                {uploadSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1.5 w-8 rounded-full transition-all duration-300',
                      index === uploadStep ? 'bg-white' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[340px] bg-card border-border p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-[#84cc16]" />
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
              {/* Camera Option */}
              <button
                onClick={() => setMethod('camera')}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 border-dashed transition-all',
                  'border-[#84cc16]/30 bg-[#84cc16]/5',
                  'hover:border-[#84cc16]/50 hover:bg-[#84cc16]/10',
                  'active:scale-[0.98]'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#84cc16] flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="font-semibold text-foreground">Tirar Foto</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Registre visualmente sua refeição
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
                className="aspect-[4/3] rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#84cc16]/50 transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <div className="h-16 w-16 rounded-full bg-[#84cc16]/20 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-[#84cc16]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Toque para tirar foto</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registre sua refeição
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1" disabled={uploading}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleCameraSubmit} 
                  disabled={!selectedImage || uploading}
                  className="flex-1 bg-[#84cc16] hover:bg-[#84cc16]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : 'Registrar'}
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
                    ? 'border-[#84cc16]/50 bg-[#84cc16]/10'
                    : 'border-secondary/50 bg-secondary/10'
                )}
              >
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                  isEmotional ? 'bg-[#84cc16]/20' : 'bg-secondary/20'
                )}>
                  {isEmotional ? (
                    <Heart className="h-5 w-5 text-[#84cc16] fill-[#84cc16] transition-colors" />
                  ) : (
                    <Star className="h-5 w-5 text-secondary transition-colors" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">
                    {isEmotional ? 'Refeição Emocional' : 'Refeição Normal'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isEmotional ? 'Identificada como emocional' : 'Toque para marcar como emocional'}
                  </p>
                </div>
              </button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleManualSubmit} 
                  disabled={!description.trim() || !calories}
                  className="flex-1 bg-[#84cc16] hover:bg-[#84cc16]/90 text-white"
                >
                  Registrar
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
