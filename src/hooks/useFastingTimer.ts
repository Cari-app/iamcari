import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [session, setSession] = useState<FastingSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<FastingTimerState>({
    elapsedSeconds: 0,
    targetSeconds: 0,
    progress: 0,
    isActive: false,
    currentPhase: 'fed',
    timeRemaining: 0,
  });

  // Fetch active fasting session from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActiveSession = async () => {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching fasting session:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSession({
          id: data.id,
          startTime: new Date(data.start_time).getTime(),
          targetHours: data.target_hours,
          isActive: true,
        });
      }
      setLoading(false);
    };

    fetchActiveSession();
  }, [user]);

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


  const startFasting = useCallback(async (targetHours: number = 16, protocolType: string = 'standard') => {
    if (!user) return;

    const { data, error } = await supabase
      .from('fasting_sessions')
      .insert({
        user_id: user.id,
        start_time: new Date().toISOString(),
        target_hours: targetHours,
        protocol_type: protocolType,
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting fasting session:', error);
      return;
    }

    if (data) {
      setSession({
        id: data.id,
        startTime: new Date(data.start_time).getTime(),
        targetHours: data.target_hours,
        isActive: true,
      });
    }
  }, [user]);

  const stopFasting = useCallback(async () => {
    if (!session?.id || !user) return;

    const endTime = new Date();
    const elapsedHours = (endTime.getTime() - session.startTime) / (1000 * 60 * 60);
    
    // Determinar se o jejum foi concluído ou pausado
    const status = elapsedHours >= session.targetHours ? 'completed' : 'paused';

    const { error } = await supabase
      .from('fasting_sessions')
      .update({ 
        end_time: endTime.toISOString(),
        status: status
      })
      .eq('id', session.id);

    if (error) {
      console.error('Error stopping fasting session:', error);
      return;
    }

    console.log(`Fasting session ${status} successfully`);
    setSession(null);
  }, [session, user]);

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
    loading,
  };
}
