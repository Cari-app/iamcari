import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDate } from '@/contexts/DateContext';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DatePickerButton() {
  const [open, setOpen] = useState(false);
  const { selectedDate, setDate } = useDate();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setOpen(false);
    }
  };

  // Limit date selection to last 90 days
  const minDate = subDays(new Date(), 89);
  const maxDate = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center press-effect hover:bg-accent transition-colors"
          aria-label="Selecionar data"
        >
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => 
            date > maxDate || date < minDate
          }
          initialFocus
          defaultMonth={selectedDate}
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
          classNames={{
            day_selected: "gradient-primary text-white hover:opacity-90",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}