import { useState, useRef, useEffect } from 'react';
import { Camera, Pencil, Utensils, Sparkles, Heart, Star, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import { FitCoinIcon } from '@/components/FitCoinIcon';
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
  const { user, profile } = useAuth();
  const [method, setMethod] = useState<InputMethod>('select');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [isEmotional, setIsEmotional] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [fitCoinBalance, setFitCoinBalance] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FITCOIN_COST = 1;

  const uploadSteps = [
    'Comprimindo imagem...',
    'Enviando para a nuvem...',
    'A Dona está analisando...',
    'Calculando calorias...',
  ];

  // Update FitCoin balance when profile changes
  useEffect(() => {
    if (profile?.token_balance !== undefined) {
      setFitCoinBalance(profile.token_balance);
    }
  }, [profile]);

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

    // Check FitCoin balance
    if (fitCoinBalance < FITCOIN_COST) {
      toast({
        title: '💎 Saldo insuficiente',
        description: `Você precisa de ${FITCOIN_COST} FitCoin para análise de IA. Saldo atual: ${fitCoinBalance}`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadStep(0);

    try {
      // Step 1: Compress image
      const compressedBlob = await compressImage(selectedImage);

      // Step 2: Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      const imageBase64 = await base64Promise;
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.jpg`;

      // Step 3: Call edge function to consume FitCoin and upload
      const { data, error: functionError } = await supabase.functions.invoke('consume-fitcoin-for-meal', {
        body: {
          imageBlob: imageBase64,
          fileName,
          isEmotional,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Erro ao processar');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado');
      }

      // Check for insufficient balance error
      if (data.error === 'insufficient_balance') {
        toast({
          title: '💎 Saldo insuficiente',
          description: `Você precisa de ${FITCOIN_COST} FitCoin. Saldo atual: ${data.currentBalance || 0}`,
          variant: 'destructive',
        });
        return;
      }

      const result = data;

      // Update local balance
      setFitCoinBalance(result.newBalance);

      // Success!
      toast({
        title: result.isAdmin ? '👑 Análise Admin' : '✅ Análise iniciada!',
        description: result.isAdmin 
          ? 'FitCoins ilimitados para admins!' 
          : `1 FitCoin consumido. Saldo: ${result.newBalance}`,
      });

      // Trigger refetch in parent component
      if (onPhotoSubmitted) {
        onPhotoSubmitted();
      }

      handleClose();
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Handle specific error types
      let errorMessage = 'Não foi possível enviar a foto.';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('autorizado')) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
        } else if (error.message.includes('402') || error.message.includes('insufficient')) {
          errorMessage = 'Saldo insuficiente de FitCoins';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: '❌ Erro no envio',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadStep(0);
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

              {/* FitCoin Balance & Cost Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <FitCoinIcon size={16} />
                    <span className="text-sm font-medium text-teal-300">Saldo</span>
                  </div>
                  <span className="text-sm font-bold text-teal-400">{fitCoinBalance} FitCoins</span>
                </div>

                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-xl border",
                  fitCoinBalance >= FITCOIN_COST
                    ? "bg-violet-500/10 border-violet-500/20"
                    : "bg-rose-500/10 border-rose-500/20"
                )}>
                  {fitCoinBalance >= FITCOIN_COST ? (
                    <>
                      <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0" />
                      <p className="text-xs text-violet-300">
                        Custo: {FITCOIN_COST} FitCoin para análise de IA
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                      <p className="text-xs text-rose-300">
                        Saldo insuficiente. Você precisa de {FITCOIN_COST} FitCoin
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleBack} className="flex-1" disabled={uploading}>
                  Voltar
                </Button>
                <Button 
                  onClick={handleCameraSubmit} 
                  disabled={!selectedImage || uploading || fitCoinBalance < FITCOIN_COST}
                  className="flex-1 gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Enviando...' : fitCoinBalance < FITCOIN_COST ? 'Saldo insuficiente' : 'Analisar'}
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
