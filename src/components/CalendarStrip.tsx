import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, isSameDay, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDate } from '@/contexts/DateContext';
import { cn } from '@/lib/utils';

export function CalendarStrip() {
  const { selectedDate, setDate, previousDay, nextDay, canGoNext } = useDate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedDayRef = useRef<HTMLButtonElement>(null);

  // Generate last 90 days
  const days = Array.from({ length: 90 }, (_, i) => subDays(new Date(), i)).reverse();

  // Auto-scroll to selected day on mount and when selectedDate changes
  useEffect(() => {
    if (selectedDayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = selectedDayRef.current;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const containerWidth = container.offsetWidth;
      
      // Center the selected element
      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [selectedDate]);

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="relative flex items-center gap-2 px-2 py-3">
        {/* Previous Day Button */}
        <button
          onClick={previousDay}
          className="shrink-0 h-10 w-10 rounded-xl bg-card hover:bg-accent flex items-center justify-center press-effect transition-colors"
          aria-label="Dia anterior"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Scrollable Days Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-2 px-1">
            {days.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isToday(day);
              const disabled = isFuture(day);

              return (
                <motion.button
                  key={day.toISOString()}
                  ref={isSelected ? selectedDayRef : null}
                  onClick={() => !disabled && setDate(day)}
                  disabled={disabled}
                  className={cn(
                    "shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all press-effect min-w-[60px]",
                    isSelected && "gradient-primary text-white shadow-violet",
                    !isSelected && !disabled && "bg-card hover:bg-accent text-foreground",
                    !isSelected && isDayToday && "ring-2 ring-primary/30",
                    disabled && "opacity-40 cursor-not-allowed"
                  )}
                  whileHover={!disabled ? { scale: 1.05 } : undefined}
                  whileTap={!disabled ? { scale: 0.95 } : undefined}
                >
                  <span className={cn(
                    "text-xs font-medium uppercase",
                    isSelected ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </span>
                  <span className={cn(
                    "text-xl font-bold tabular-nums mt-0.5",
                    isSelected ? "text-white" : "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isDayToday && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Next Day Button */}
        <button
          onClick={nextDay}
          disabled={!canGoNext}
          className={cn(
            "shrink-0 h-10 w-10 rounded-xl bg-card hover:bg-accent flex items-center justify-center press-effect transition-colors",
            !canGoNext && "opacity-40 cursor-not-allowed"
          )}
          aria-label="Próximo dia"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}