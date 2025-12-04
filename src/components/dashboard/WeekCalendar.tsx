import { useState, useEffect, useRef, useCallback } from 'react';
import { format, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const today = new Date();
  const days = Array.from({ length: 31 }, (_, i) => subDays(today, 15 - i));

  const ITEM_WIDTH = 44; // w-11 = 44px

  const findCenterItem = useCallback(() => {
    if (!scrollRef.current) return;
    
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
    
    const centerDay = days[closestIndex];
    if (centerDay && !isSameDay(centerDay, selectedDate)) {
      onDateSelect(centerDay);
    }
  }, [days, selectedDate, onDateSelect]);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const element = itemRefs.current.get(index);
    if (element && scrollRef.current) {
      const container = scrollRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior });
    }
  }, []);

  // Center today on mount
  useEffect(() => {
    const todayIndex = days.findIndex(day => isSameDay(day, today));
    if (todayIndex !== -1) {
      setTimeout(() => scrollToIndex(todayIndex, 'auto'), 50);
    }
  }, []);

  // Handle scroll end - snap to center and select
  const handleScrollEnd = useCallback(() => {
    findCenterItem();
    
    // Snap to center
    if (!scrollRef.current) return;
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
    
    scrollToIndex(closestIndex, 'smooth');
  }, [findCenterItem, scrollToIndex]);

  // Debounced scroll handler
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isDragging) {
          handleScrollEnd();
        }
      }, 100);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScrollEnd, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleScrollEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    handleScrollEnd();
  };

  return (
    <div 
      ref={scrollRef}
      className="flex items-end justify-start gap-0 overflow-x-auto scrollbar-hide py-4 px-8 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayName = format(day, 'EEEEE', { locale: ptBR }).toUpperCase();
        const dayNumber = format(day, 'd');
        
        return (
          <motion.button
            key={index}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
            }}
            className="flex flex-col items-center shrink-0 transition-all duration-300 ease-out w-11"
          >
            <motion.span 
              className={cn(
                'font-semibold tracking-wider transition-all duration-300',
                isSelected
                  ? 'text-primary' 
                  : 'text-white/35'
              )}
              animate={{ 
                fontSize: isSelected ? '13px' : '10px',
                marginBottom: isSelected ? '4px' : '2px',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {dayName}
            </motion.span>
            <motion.span 
              className={cn(
                'font-bold transition-all duration-300',
                isSelected
                  ? 'text-primary' 
                  : 'text-white/50'
              )}
              animate={{ 
                fontSize: isSelected ? '28px' : '18px',
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {dayNumber}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
