import { useState, useEffect, useRef } from 'react';
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
  const todayRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const today = new Date();
  const days = Array.from({ length: 31 }, (_, i) => subDays(today, 15 - i));
  
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const todayElement = todayRef.current;
      const containerWidth = container.offsetWidth;
      const todayLeft = todayElement.offsetLeft;
      const todayWidth = todayElement.offsetWidth;
      const scrollPosition = todayLeft - (containerWidth / 2) + (todayWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'auto' });
    }
  }, []);

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

  return (
    <div 
      ref={scrollRef}
      className="flex items-end justify-start gap-1 overflow-x-auto scrollbar-hide py-4 px-6 cursor-grab active:cursor-grabbing select-none"
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
              'flex flex-col items-center justify-end rounded-2xl transition-all duration-300 shrink-0',
              isToday 
                ? 'w-14 py-3 px-2' 
                : 'w-10 py-2 px-1',
              isSelected && !isToday && 'bg-primary/10'
            )}
          >
            <span className={cn(
              'font-medium tracking-wide transition-all duration-300',
              isToday ? 'text-xs mb-1' : 'text-[10px] mb-0.5',
              isSelected || isToday
                ? 'text-primary' 
                : 'text-white/40'
            )}>
              {dayName}
            </span>
            <span className={cn(
              'font-bold transition-all duration-300',
              isToday ? 'text-3xl' : 'text-lg',
              isSelected || isToday
                ? 'text-primary' 
                : 'text-white/60'
            )}>
              {dayNumber}
            </span>
            {isSelected && (
              <motion.div 
                layoutId="selectedIndicator"
                className="w-1.5 h-1.5 rounded-full bg-primary mt-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
