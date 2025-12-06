import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialScrolling = useRef(true);
  
  const today = useMemo(() => new Date(), []);
  
  // Pre-calculate all day data to avoid recalculation on render
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

  const findCenterIndex = useCallback((): number => {
    if (!scrollRef.current) return 15;
    
    const container = scrollRef.current;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    itemRefs.current.forEach((element, index) => {
      const elementCenter = element.offsetLeft + element.offsetWidth / 2;
      const distance = Math.abs(containerCenter - elementCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const element = itemRefs.current.get(index);
    if (element && scrollRef.current) {
      const container = scrollRef.current;
      const scrollPosition = element.offsetLeft - (container.offsetWidth / 2) + (element.offsetWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior });
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    const centerIndex = findCenterIndex();
    const centerDay = days[centerIndex];
    
    // Always update visible month
    if (centerDay) {
      setVisibleMonth(format(centerDay.date, 'MMMM yyyy', { locale: ptBR }));
    }
    
    // Skip date selection during initial scroll
    if (isInitialScrolling.current) {
      isInitialScrolling.current = false;
      return;
    }
    
    if (centerDay && !isSameDay(centerDay.date, selectedDate)) {
      onDateSelect(centerDay.date);
    }
    
    scrollToIndex(centerIndex, 'smooth');
  }, [findCenterIndex, days, selectedDate, onDateSelect, scrollToIndex]);

  // Center on selected date on mount
  useEffect(() => {
    isInitialScrolling.current = true;
    const selectedIndex = days.findIndex(day => isSameDay(day.date, selectedDate));
    if (selectedIndex !== -1) {
      requestAnimationFrame(() => {
        scrollToIndex(selectedIndex, 'auto');
      });
    }
  }, [days, selectedDate, scrollToIndex]);

  // Scroll listener with debounce
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        if (!dragState.current.isDragging) {
          handleScrollEnd();
        }
      }, 100);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [handleScrollEnd]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragState.current = {
      isDragging: true,
      startX: e.pageX - (scrollRef.current?.offsetLeft || 0),
      scrollLeft: scrollRef.current?.scrollLeft || 0,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - dragState.current.startX) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
    }
  };

  const handlePointerUp = () => {
    dragState.current.isDragging = false;
    handleScrollEnd();
  };

  const navigateDays = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = findCenterIndex();
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(days.length - 1, currentIndex + 1);
    
    scrollToIndex(newIndex, 'smooth');
    
    const newDay = days[newIndex];
    if (newDay) {
      onDateSelect(newDay.date);
      setVisibleMonth(format(newDay.date, 'MMMM yyyy', { locale: ptBR }));
    }
  }, [findCenterIndex, days, scrollToIndex, onDateSelect]);

  return (
    <div className="flex flex-col">
      <span className="text-center text-sm text-white/70 capitalize mb-1">
        {visibleMonth}
      </span>
      <div className="relative flex items-center">
        <button 
          onClick={() => navigateDays('prev')}
          className="absolute left-0 z-10 p-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex items-end gap-0 overflow-x-auto scrollbar-hide py-4 px-12 cursor-grab active:cursor-grabbing select-none touch-pan-x flex-1"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
        {days.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate);
          
          return (
            <div
              key={index}
              ref={(el) => {
                if (el) itemRefs.current.set(index, el);
              }}
              className="flex flex-col items-center shrink-0 w-11"
            >
              <span 
                className={cn(
                  'font-semibold tracking-wider transition-all duration-200 ease-out',
                  isSelected 
                    ? 'text-[13px] mb-1 text-lime-500' 
                    : 'text-[10px] mb-0.5 text-white/50'
                )}
              >
                {day.dayName}
              </span>
              <span 
                className={cn(
                  'font-bold transition-all duration-200 ease-out',
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
        
        <button 
          onClick={() => navigateDays('next')}
          className="absolute right-0 z-10 p-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
