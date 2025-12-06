import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
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
  const scrollEndTimer = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  
  const today = useMemo(() => new Date(), []);
  const itemWidth = 44; // w-11 = 44px
  
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

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollPosition = (index * itemWidth) - (container.offsetWidth / 2) + (itemWidth / 2);
    container.scrollTo({ 
      left: scrollPosition, 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  }, []);

  const getCenterIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 15;
    
    const centerScroll = container.scrollLeft + container.offsetWidth / 2;
    const centerIndex = Math.round(centerScroll / itemWidth);
    return Math.max(0, Math.min(days.length - 1, centerIndex));
  }, [days.length]);

  // Center on selected date on mount
  useEffect(() => {
    const selectedIndex = days.findIndex(day => isSameDay(day.date, selectedDate));
    if (selectedIndex !== -1) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollToIndex(selectedIndex, false);
        isInitialMount.current = false;
      });
    }
  }, []);

  // Handle scroll with debounced update
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Clear previous timer
      if (scrollEndTimer.current) {
        window.clearTimeout(scrollEndTimer.current);
      }
      
      // Debounce: wait 250ms after scroll stops
      scrollEndTimer.current = window.setTimeout(() => {
        if (isInitialMount.current) return;
        
        const centerIndex = getCenterIndex();
        const centerDay = days[centerIndex];
        
        if (centerDay) {
          // Update month display
          setVisibleMonth(format(centerDay.date, 'MMMM yyyy', { locale: ptBR }));
          
          // Snap to center
          scrollToIndex(centerIndex, true);
          
          // Update selected date
          if (!isSameDay(centerDay.date, selectedDate)) {
            onDateSelect(centerDay.date);
          }
        }
      }, 250);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    };
  }, [days, selectedDate, onDateSelect, getCenterIndex, scrollToIndex]);

  const handleDayClick = (index: number) => {
    scrollToIndex(index, true);
    const day = days[index];
    if (day && !isSameDay(day.date, selectedDate)) {
      onDateSelect(day.date);
      setVisibleMonth(format(day.date, 'MMMM yyyy', { locale: ptBR }));
    }
  };

  return (
    <div className="flex flex-col">
      <span className="text-center text-sm text-white/70 capitalize mb-1">
        {visibleMonth}
      </span>
      <div 
        ref={scrollRef}
        className="flex items-end overflow-x-auto scrollbar-hide py-4 px-12 overscroll-x-contain"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {days.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate);
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(index)}
              className="flex flex-col items-center shrink-0 w-11 cursor-pointer"
            >
              <span 
                className={cn(
                  'font-semibold tracking-wider transition-all duration-200',
                  isSelected 
                    ? 'text-[13px] mb-1 text-lime-500' 
                    : 'text-[10px] mb-0.5 text-white/50'
                )}
              >
                {day.dayName}
              </span>
              <span 
                className={cn(
                  'font-bold transition-all duration-200',
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
