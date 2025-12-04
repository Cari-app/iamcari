import { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate 14 days (7 before today + today + 6 after)
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => subDays(today, 7 - i));
  
  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = days.findIndex(d => isSameDay(d, selectedDate));
      if (selectedIndex >= 0) {
        const scrollPosition = selectedIndex * 56 - scrollRef.current.offsetWidth / 2 + 28;
        scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 -mx-4"
    >
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        const dayName = format(day, 'EEEEE', { locale: ptBR }).toUpperCase();
        const dayNumber = format(day, 'd');
        
        return (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateSelect(day)}
            className={cn(
              'flex flex-col items-center min-w-[48px] py-2 px-2 rounded-xl transition-all',
              isSelected 
                ? 'text-primary font-bold' 
                : 'text-white/60 hover:text-white/80'
            )}
          >
            <span className="text-xs font-medium">{dayName}</span>
            <span className={cn(
              'text-lg font-bold mt-1',
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
