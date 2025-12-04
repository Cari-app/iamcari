import { Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Protocol {
  hours: number;
  label: string;
  description: string;
}

const PROTOCOLS: Protocol[] = [
  { hours: 12, label: '12h', description: 'Iniciante' },
  { hours: 16, label: '16h', description: 'Cari Padrão' },
  { hours: 18, label: '18h', description: 'Avançado' },
  { hours: 23, label: '23h', description: 'OMAD' },
];

interface ProtocolSelectorProps {
  selectedHours: number;
  onSelect: (hours: number, isCustom?: boolean) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

export function ProtocolSelector({
  selectedHours,
  onSelect,
  isOpen,
  onOpenChange,
  disabled,
}: ProtocolSelectorProps) {
  const [customHours, setCustomHours] = useState(selectedHours);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  // Check if selected hours matches a preset
  const isPresetHours = PROTOCOLS.some(p => p.hours === selectedHours);
  
  useEffect(() => {
    if (!isPresetHours && selectedHours >= 10 && selectedHours <= 48) {
      setIsCustomMode(true);
      setCustomHours(selectedHours);
    }
  }, [selectedHours, isPresetHours]);

  const handleSliderChange = (value: number[]) => {
    setCustomHours(value[0]);
    setIsCustomMode(true);
  };

  const handleCustomConfirm = () => {
    onSelect(customHours, true);
    onOpenChange(false);
  };
  
  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer transition-all hover:bg-green-100 px-4 py-2 text-sm",
          "border-green-600 text-green-700 bg-green-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onOpenChange(true)}
      >
        <Clock className="h-4 w-4 mr-2" />
        Meta: {selectedHours}h
      </Badge>

      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-transparent border-none">
          <div className="mx-auto w-full max-w-lg bg-background/95 backdrop-blur-xl border border-border rounded-t-3xl">
            <DrawerHeader className="text-center pb-2">
              <DrawerTitle className="text-xl">Escolha seu Protocolo</DrawerTitle>
              <DrawerDescription>
                Selecione a duração do seu jejum
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="px-4 pb-8 space-y-3">
            {PROTOCOLS.map((protocol) => (
              <button
                key={protocol.hours}
                onClick={() => {
                  setIsCustomMode(false);
                  onSelect(protocol.hours, false);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center justify-between transition-all",
                  "border bg-card hover:bg-accent/50",
                  selectedHours === protocol.hours && !isCustomMode
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                    selectedHours === protocol.hours && !isCustomMode
                      ? "gradient-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {protocol.label}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{protocol.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {protocol.hours} horas de jejum
                    </p>
                  </div>
                </div>
                
                {selectedHours === protocol.hours && !isCustomMode && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}

            {/* Custom Duration Section */}
            <div
              className={cn(
                "w-full p-6 rounded-2xl border transition-all",
                isCustomMode
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">Personalizado</p>
                  <p className="text-sm text-muted-foreground">
                    Defina sua própria meta
                  </p>
                </div>
                {isCustomMode && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text tabular-nums">
                    ⏱️ {customHours}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Meta de jejum
                  </p>
                </div>

                <Slider
                  value={[customHours]}
                  onValueChange={handleSliderChange}
                  min={10}
                  max={48}
                  step={0.5}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10h</span>
                  <span>48h</span>
                </div>

                {isCustomMode && (
                  <button
                    onClick={handleCustomConfirm}
                    className="w-full py-2 rounded-xl gradient-primary text-white font-medium text-sm press-effect"
                  >
                    Confirmar {customHours}h
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
