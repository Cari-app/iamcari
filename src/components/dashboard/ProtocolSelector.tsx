import { Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface Protocol {
  hours: number;
  label: string;
  description: string;
}

const PROTOCOLS: Protocol[] = [
  { hours: 12, label: '12h', description: 'Iniciante' },
  { hours: 16, label: '16h', description: 'LeveStay Padrão' },
  { hours: 18, label: '18h', description: 'Avançado' },
  { hours: 23, label: '23h', description: 'OMAD' },
];

interface ProtocolSelectorProps {
  selectedHours: number;
  onSelect: (hours: number) => void;
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
  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          "cursor-pointer transition-all hover:bg-primary/10 px-4 py-2 text-sm",
          "border-primary/30 text-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onOpenChange(true)}
      >
        <Clock className="h-4 w-4 mr-2" />
        Meta: {selectedHours}h
      </Badge>

      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-background/95 backdrop-blur-xl border-border">
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
                  onSelect(protocol.hours);
                  onOpenChange(false);
                }}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center justify-between transition-all",
                  "border bg-card hover:bg-accent/50",
                  selectedHours === protocol.hours
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg",
                    selectedHours === protocol.hours
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
                
                {selectedHours === protocol.hours && (
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
