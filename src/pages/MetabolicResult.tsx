import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Target, CheckCircle2, AlertTriangle,
  Flame, Shield, Zap, TrendingUp, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { Logo } from '@/components/Logo';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { profileTitles, type QuizResult } from '@/lib/metabolicFastingEngine';

const profileIcons: Record<string, React.ComponentType<any>> = {
  inicio_leve: Clock,
  progressivo: TrendingUp,
  flexivel: Zap,
  estruturado: Flame,
  alta_vulnerabilidade: Shield,
};

const profileColors: Record<string, { text: string; bg: string }> = {
  inicio_leve: { text: 'text-teal-500', bg: 'bg-teal-500/10' },
  progressivo: { text: 'text-blue-500', bg: 'bg-blue-500/10' },
  flexivel: { text: 'text-amber-500', bg: 'bg-amber-500/10' },
  estruturado: { text: 'text-primary', bg: 'bg-primary/10' },
  alta_vulnerabilidade: { text: 'text-rose-500', bg: 'bg-rose-500/10' },
};

export default function MetabolicResult() {
  const navigate = useNavigate();
  const { user, profile: userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('fasting_plan_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('active_plan', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setResult({
            profile_type: data.profile_type,
            profile_label: data.profile_label,
            plan_focus: data.plan_focus,
            recommended_protocol_hours: data.recommended_protocol_hours,
            protocol_label: `${data.recommended_protocol_hours} horas de jejum`,
            schedule_start: data.schedule_start,
            schedule_end: data.schedule_end,
            schedule_label: data.schedule_label,
            weekly_goal_days: data.weekly_goal_days,
            progression_next_step: data.progression_next_step,
            behavior_alerts: (data.behavior_alerts as string[]) || [],
            reason_summary: data.reason_summary,
            support_style: data.support_style,
            plan_style: data.plan_style,
            dynamic_tags: (data.dynamic_tags as string[]) || [],
          });
        } else {
          toast({ title: '⚠️ Nenhum plano encontrado', description: 'Complete a avaliação primeiro.', variant: 'destructive' });
          navigate('/metabolic-quiz');
        }
      } catch (err) {
        console.error(err);
        toast({ title: '❌ Erro', description: 'Não foi possível carregar seu resultado.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] pb-32 bg-background relative">
        <GradientHeader />
        <div className="mx-auto max-w-lg relative z-10 pt-20 px-4 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!result) return null;

  const Icon = profileIcons[result.profile_type] || Target;
  const colors = profileColors[result.profile_type] || profileColors.progressivo;
  const title = profileTitles[result.profile_type] || result.profile_label;

  return (
    <div className="min-h-[100dvh] pb-32 bg-background relative">
      <GradientHeader />
      <div className="mx-auto max-w-lg relative">
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/content')} className="text-white hover:bg-white/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo size="sm" forceDark />
            </div>
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">{userProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
          </header>

          <main className="px-4 pt-6 space-y-4">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-start gap-4 mb-4">
                <div className={`h-16 w-16 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-8 w-8 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
                  <p className={`text-sm font-medium ${colors.text}`}>{result.profile_label}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.reason_summary}</p>
            </motion.div>

            {/* Plan Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Seu Plano Inicial</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Protocolo" value={result.protocol_label} icon={<Clock className="w-4 h-4 text-primary" />} />
                <InfoBlock label="Horário" value={result.schedule_label} icon={<Calendar className="w-4 h-4 text-primary" />} />
                <InfoBlock label="Meta Semanal" value={`${result.weekly_goal_days} de 7 dias`} icon={<Target className="w-4 h-4 text-primary" />} />
                <InfoBlock label="Progressão" value={result.progression_next_step} icon={<TrendingUp className="w-4 h-4 text-primary" />} />
              </div>
            </motion.div>

            {/* Behavior Alerts */}
            {result.behavior_alerts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold text-foreground">Pontos de Atenção</h2>
                </div>
                <ul className="space-y-3">
                  {result.behavior_alerts.map((alert, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{alert}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button onClick={() => navigate('/fasting')} className="w-full h-14 rounded-2xl font-semibold text-base press-effect">
                Começar meu plano
              </Button>
            </motion.div>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function GradientHeader() {
  return (
    <div className="absolute inset-x-0 -top-[100px] h-[580px]">
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

function InfoBlock({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
