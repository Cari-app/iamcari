import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Content() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('fasting_plan_results')
      .select('id')
      .eq('user_id', user.id)
      .eq('active_plan', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setHasPlan(!!data));
  }, [user]);

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

          <div className="px-4 pt-8 pb-32 space-y-6">
            {/* Metabolic Quiz CTA */}
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

              {hasPlan ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Avaliação concluída</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => navigate('/metabolic-result')}
                    >
                      Ver resultado
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-xl text-muted-foreground"
                      onClick={() => navigate('/metabolic-quiz')}
                    >
                      Refazer
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('/metabolic-quiz')}
                  className="w-full h-12 rounded-xl font-semibold"
                >
                  Iniciar avaliação
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Coming soon section */}
            <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/5 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Mais conteúdos em breve</h3>
              <p className="text-sm text-muted-foreground">
                Artigos, dicas e guias sobre jejum intermitente e saúde metabólica.
              </p>
              <div className="px-4 py-2 rounded-full bg-primary/5 border border-primary/10 inline-block">
                <span className="text-xs font-semibold text-primary">🚀 Em breve</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
