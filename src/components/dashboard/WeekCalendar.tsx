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

  const scrollToCenter = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
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
      setTimeout(() => scrollToCenter(todayIndex, 'auto'), 50);
    }
  }, []);

  // Center selected date when it changes
  useEffect(() => {
    const selectedIndex = days.findIndex(day => isSameDay(day, selectedDate));
    if (selectedIndex !== -1 && !isDragging) {
      scrollToCenter(selectedIndex, 'smooth');
    }
  }, [selectedDate, scrollToCenter, isDragging]);

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

  const handleMouseUp = () => setIsDragging(false);

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

  const handleSelect = (day: Date, index: number) => {
    if (!isDragging) {
      onDateSelect(day);
    }
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
      onTouchEnd={() => setIsDragging(false)}
    >
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const dayName = format(day, 'EEEEE', { locale: ptBR }).toUpperCase();
        const dayNumber = format(day, 'd');
        
        return (
          <motion.button
            key={index}
            ref={(el) => {
              if (el) itemRefs.current.set(index, el);
            }}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleSelect(day, index)}
            className={cn(
              'flex flex-col items-center justify-end shrink-0 transition-all duration-300 ease-out',
              isSelected 
                ? 'w-16 py-3' 
                : 'w-11 py-2'
            )}
          >
            <motion.span 
              className={cn(
                'font-semibold tracking-wider transition-all duration-300',
                isSelected ? 'text-[11px] mb-1.5' : 'text-[9px] mb-1',
                isSelected
                  ? 'text-primary' 
                  : 'text-white/35'
              )}
              animate={{ 
                opacity: isSelected ? 1 : 0.6,
              }}
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
                fontSize: isSelected ? '32px' : '18px',
                opacity: isSelected ? 1 : 0.7,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {dayNumber}
            </motion.span>
            <motion.div 
              className="w-1 h-1 rounded-full bg-primary mt-2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isSelected ? 1 : 0, 
                opacity: isSelected ? 1 : 0 
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
