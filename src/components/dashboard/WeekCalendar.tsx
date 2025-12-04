import { useState, useEffect, useRef } from 'react';
import { format, isSameDay, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const today = new Date();
  // Generate 30 days (15 before today + today + 14 after)
  const days = Array.from({ length: 31 }, (_, i) => subDays(today, 15 - i));
  
  // Center today on mount
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayElement = todayRef.current;
      const containerWidth = container.offsetWidth;
      const todayLeft = todayElement.offsetLeft;
      const todayWidth = todayElement.offsetWidth;
      
      // Center today in the container
      const scrollPosition = todayLeft - (containerWidth / 2) + (todayWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'auto' });
    }
  }, []);

  // Mouse/Touch drag handlers
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

  return (
    <div 
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto scrollbar-hide py-3 px-4 cursor-grab active:cursor-grabbing select-none"
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
            ref={isToday ? todayRef : undefined}
            whileTap={{ scale: 0.95 }}
            onClick={() => !isDragging && onDateSelect(day)}
            className={cn(
              'flex flex-col items-center py-2 rounded-xl transition-all shrink-0',
              isToday ? 'min-w-[56px] px-3' : 'min-w-[44px] px-2',
              isSelected 
                ? 'text-primary' 
                : 'text-white/50 hover:text-white/70'
            )}
          >
            <span className={cn(
              'font-medium',
              isToday ? 'text-sm' : 'text-xs'
            )}>
              {dayName}
            </span>
            <span className={cn(
              'font-bold mt-1',
              isToday ? 'text-2xl' : 'text-lg',
              isSelected && 'text-primary'
            )}>
              {dayNumber}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
