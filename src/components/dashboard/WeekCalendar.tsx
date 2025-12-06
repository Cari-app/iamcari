import { useEffect, useRef, useMemo, useState } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

interface DayItem {
  date: Date;
  dayName: string;
  dayNumber: string;
}

export function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => 
    format(selectedDate, 'MMMM yyyy', { locale: ptBR })
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const scrollEndTimer = useRef<number | null>(null);
  
  const today = useMemo(() => new Date(), []);
  
  const days = useMemo<DayItem[]>(() => 
    Array.from({ length: 31 }, (_, i) => {
      const date = subDays(today, 15 - i);
      return {
        date,
        dayName: format(date, 'EEEEE', { locale: ptBR }).toUpperCase(),
        dayNumber: format(date, 'd'),
      };
    }), [today]
  );

  // Scroll to selected date on mount
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const selectedIndex = days.findIndex(day => isSameDay(day.date, selectedDate));
    if (selectedIndex !== -1) {
      const itemWidth = 44; // w-11 = 44px
      const scrollPosition = (selectedIndex * itemWidth) - (container.offsetWidth / 2) + (itemWidth / 2);
      container.scrollLeft = scrollPosition;
    }
  }, []);

  // Handle scroll end detection
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      isScrolling.current = true;
      
      if (scrollEndTimer.current) {
        cancelAnimationFrame(scrollEndTimer.current);
      }
      
      scrollEndTimer.current = requestAnimationFrame(() => {
        setTimeout(() => {
          if (!isScrolling.current) return;
          isScrolling.current = false;
          
          // Find center item
          const itemWidth = 44;
          const centerScroll = container.scrollLeft + container.offsetWidth / 2;
          const centerIndex = Math.round(centerScroll / itemWidth);
          const clampedIndex = Math.max(0, Math.min(days.length - 1, centerIndex));
          
          const centerDay = days[clampedIndex];
          if (centerDay) {
            setVisibleMonth(format(centerDay.date, 'MMMM yyyy', { locale: ptBR }));
            
            if (!isSameDay(centerDay.date, selectedDate)) {
              onDateSelect(centerDay.date);
            }
          }
        }, 80);
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimer.current) cancelAnimationFrame(scrollEndTimer.current);
    };
  }, [days, selectedDate, onDateSelect]);

  const handleDayClick = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    
    const itemWidth = 44;
    const scrollPosition = (index * itemWidth) - (container.offsetWidth / 2) + (itemWidth / 2);
    container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    
    const day = days[index];
    if (day && !isSameDay(day.date, selectedDate)) {
      onDateSelect(day.date);
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-center text-sm text-white/70 capitalize mb-1">
        {visibleMonth}
      </span>
      <div 
        ref={scrollRef}
        className="flex items-end overflow-x-auto scrollbar-hide py-4 px-12 scroll-smooth snap-x snap-mandatory overscroll-x-contain"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
        }}
      >
        {days.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate);
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(index)}
              className="flex flex-col items-center shrink-0 w-11 snap-center cursor-pointer"
              style={{ willChange: 'transform' }}
            >
              <span 
                className={cn(
                  'font-semibold tracking-wider transition-all duration-150',
                  isSelected 
                    ? 'text-[13px] mb-1 text-lime-500' 
                    : 'text-[10px] mb-0.5 text-white/50'
                )}
              >
                {day.dayName}
              </span>
              <span 
                className={cn(
                  'font-bold transition-all duration-150',
                  isSelected 
                    ? 'text-[28px] text-lime-500' 
                    : 'text-lg text-white/60'
                )}
              >
                {day.dayNumber}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
