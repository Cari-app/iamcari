import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DateRangeType {
  from: Date | undefined;
  to?: Date | undefined;
}

interface DateRangePickerProps {
  dateRange: DateRangeType | undefined;
  onDateRangeChange: (range: DateRangeType | undefined) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange?.from) return 'Selecionar período';
    if (!dateRange.to) return format(dateRange.from, "d 'de' MMM", { locale: ptBR });
    return `${format(dateRange.from, "d 'de' MMM", { locale: ptBR })} - ${format(dateRange.to, "d 'de' MMM", { locale: ptBR })}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-10 px-3 gap-2",
            "bg-card/80 border-border/60 hover:bg-card",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <CalendarDays className="h-4 w-4 text-lime-500" />
          <span className="text-sm">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange as any}
          onSelect={onDateRangeChange as any}
          locale={ptBR}
          numberOfMonths={1}
          initialFocus
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
