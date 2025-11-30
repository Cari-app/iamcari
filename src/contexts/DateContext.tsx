import { createContext, useContext, useState, ReactNode } from 'react';
import { startOfDay, endOfDay, subDays, addDays, isToday, isFuture } from 'date-fns';

interface DateContextValue {
  selectedDate: Date;
  setDate: (date: Date) => void;
  goToToday: () => void;
  previousDay: () => void;
  nextDay: () => void;
  getStartOfDay: () => Date;
  getEndOfDay: () => Date;
  isSelectedToday: boolean;
  canGoNext: boolean;
}

const DateContext = createContext<DateContextValue | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const previousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const nextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isFuture(nextDate)) {
      setSelectedDate(nextDate);
    }
  };

  const getStartOfDay = () => {
    return startOfDay(selectedDate);
  };

  const getEndOfDay = () => {
    return endOfDay(selectedDate);
  };

  const isSelectedToday = isToday(selectedDate);
  const canGoNext = !isFuture(addDays(selectedDate, 1));

  return (
    <DateContext.Provider
      value={{
        selectedDate,
        setDate: setSelectedDate,
        goToToday,
        previousDay,
        nextDay,
        getStartOfDay,
        getEndOfDay,
        isSelectedToday,
        canGoNext,
      }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}