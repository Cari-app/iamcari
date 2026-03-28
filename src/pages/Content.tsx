import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Target, CheckCircle2, AlertTriangle,
  Flame, Shield, Zap, TrendingUp, Calendar, Sparkles, ArrowRight, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
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

export default function Content() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('fasting_plan_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('active_plan', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          // No assessment yet — redirect to quiz
          navigate('/metabolic-quiz');
          return;
        }
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
        }
        setLoading(false);
      });
  }, [user]);

  const hasResult = !!result;

  return (
    <div className="min-h-[100dvh] bg-background relative">
      {/* Premium gradient header */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-lg relative">
        <div className="relative z-10">
          <AppHeader className="pt-[5px] py-0" />

          <div className="px-4 pt-8 pb-32 space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl" />
              </>
            ) : !hasResult ? (
              /* No result yet — show CTA to start quiz */
              <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">Avaliação Metabólica</h2>
                    <p className="text-xs text-muted-foreground">Descubra seu plano ideal de jejum</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Responda algumas perguntas rápidas e receba um plano de jejum personalizado para sua rotina, objetivos e nível de adaptação.
                </p>
                <Button onClick={() => navigate('/metabolic-quiz')} className="w-full h-12 rounded-xl font-semibold">
                  Iniciar avaliação
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              /* Has result — show full result inline */
              <ResultContent result={result} onRetake={() => navigate('/metabolic-quiz')} />
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ResultContent({ result, onRetake }: { result: QuizResult; onRetake: () => void }) {
  const Icon = profileIcons[result.profile_type] || Target;
  const colors = profileColors[result.profile_type] || profileColors.progressivo;
  const title = profileTitles[result.profile_type] || result.profile_label;

  return (
    <>
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-start gap-4 mb-4">
          <div className={`h-14 w-14 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-7 w-7 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground mb-1">{title}</h1>
            <p className={`text-sm font-medium ${colors.text}`}>{result.profile_label}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.reason_summary}</p>
      </motion.div>

      {/* Plan Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-card border border-border">
        <h2 className="text-base font-semibold text-foreground mb-4">Seu Plano Inicial</h2>
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
            <h2 className="text-base font-semibold text-foreground">Pontos de Atenção</h2>
          </div>
          <ul className="space-y-3">
            {result.behavior_alerts.map((alert, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{alert}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Retake button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button variant="ghost" onClick={onRetake} className="w-full text-muted-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refazer avaliação
        </Button>
      </motion.div>
    </>
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
