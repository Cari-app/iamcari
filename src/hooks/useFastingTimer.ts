import { useState, useEffect, useCallback } from 'react';

interface FastingSession {
  id?: string;
  startTime: number;
  targetHours: number;
  isActive: boolean;
}

interface FastingTimerState {
  elapsedSeconds: number;
  targetSeconds: number;
  progress: number;
  isActive: boolean;
  currentPhase: FastingPhase;
  timeRemaining: number;
}

type FastingPhase = 'fed' | 'fasting' | 'ketosis' | 'autophagy' | 'deep-autophagy';

const STORAGE_KEY = 'levestay-fasting-session';

const getPhase = (hours: number): FastingPhase => {
  if (hours < 4) return 'fed';
  if (hours < 12) return 'fasting';
  if (hours < 16) return 'ketosis';
  if (hours < 24) return 'autophagy';
  return 'deep-autophagy';
};

const phaseInfo: Record<FastingPhase, { label: string; color: string; description: string }> = {
  'fed': { label: 'Alimentado', color: 'text-muted-foreground', description: 'Seu corpo está digerindo' },
  'fasting': { label: 'Jejum Inicial', color: 'text-primary', description: 'Glicose sendo consumida' },
  'ketosis': { label: 'Cetose', color: 'text-secondary', description: 'Queimando gordura' },
  'autophagy': { label: 'Autofagia', color: 'text-teal', description: 'Renovação celular ativa' },
  'deep-autophagy': { label: 'Autofagia Profunda', color: 'text-violet', description: 'Máxima regeneração' },
};

export function useFastingTimer() {
  const [session, setSession] = useState<FastingSession | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [state, setState] = useState<FastingTimerState>({
    elapsedSeconds: 0,
    targetSeconds: 0,
    progress: 0,
    isActive: false,
    currentPhase: 'fed',
    timeRemaining: 0,
  });

  // Calculate elapsed time based on real timestamps
  const calculateState = useCallback(() => {
    if (!session || !session.isActive) {
      setState({
        elapsedSeconds: 0,
        targetSeconds: 0,
        progress: 0,
        isActive: false,
        currentPhase: 'fed',
        timeRemaining: 0,
      });
      return;
    }

    const now = Date.now();
    const elapsed = Math.floor((now - session.startTime) / 1000);
    const target = session.targetHours * 3600;
    const progress = Math.min((elapsed / target) * 100, 100);
    const elapsedHours = elapsed / 3600;
    const remaining = Math.max(target - elapsed, 0);

    setState({
      elapsedSeconds: elapsed,
      targetSeconds: target,
      progress,
      isActive: true,
      currentPhase: getPhase(elapsedHours),
      timeRemaining: remaining,
    });
  }, [session]);

  // Update every second when active
  useEffect(() => {
    calculateState();
    
    if (session?.isActive) {
      const interval = setInterval(calculateState, 1000);
      return () => clearInterval(interval);
    }
  }, [session, calculateState]);

  // Persist session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const startFasting = useCallback((targetHours: number = 16) => {
    const newSession: FastingSession = {
      startTime: Date.now(),
      targetHours,
      isActive: true,
    };
    setSession(newSession);
  }, []);

  const stopFasting = useCallback(() => {
    setSession(null);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0'),
      formatted: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
    };
  };

  return {
    ...state,
    startFasting,
    stopFasting,
    formatTime,
    phaseInfo: phaseInfo[state.currentPhase],
    targetHours: session?.targetHours || 16,
  };
}
