import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle2, TrendingUp, Flame, Zap, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import logoImage from '@/assets/logo-cari.png';

interface ProtocolInfo {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  readinessLevel: 'low' | 'medium' | 'high';
  tips: string[];
}

const protocolsMap: Record<string, ProtocolInfo> = {
  not_ready: {
    id: 'not_ready',
    name: 'Não Recomendado Ainda',
    subtitle: 'Você precisa fazer um preparo antes',
    description: 'Com base nas suas respostas, identificamos que você ainda não está pronto para iniciar o jejum intermitente. Mas não desanime! Com algumas mudanças na rotina, você chegará lá.',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    readinessLevel: 'low',
    tips: [
      'Comece reduzindo açúcar e alimentos processados',
      'Trabalhe o controle emocional com a comida',
      'Organize melhor seus horários de refeição',
      'Consulte um profissional para acompanhamento'
    ]
  },
  preparation: {
    id: 'preparation',
    name: 'Preparação para o Jejum',
    subtitle: '7 dias de adaptação',
    description: 'Você está quase pronto! Vamos fazer uma preparação de 7 dias para ajustar sua rotina e relação com a comida antes de começar o jejum.',
    icon: Calendar,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    readinessLevel: 'medium',
    tips: [
      'Dias 1-3: Elimine lanches entre refeições',
      'Dias 4-5: Adie o café da manhã em 1-2 horas',
      'Dias 6-7: Pratique jantar mais cedo',
      'Mantenha-se bem hidratado durante o dia'
    ]
  },
  '12_12': {
    id: '12_12',
    name: 'Jejum Leve 12/12',
    subtitle: 'Perfeito para iniciantes',
    description: 'Este é o protocolo ideal para quem está começando. Você fará 12 horas de jejum e terá 12 horas de janela alimentar. Simples e eficaz!',
    icon: Clock,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    readinessLevel: 'medium',
    tips: [
      'Jantar às 20h e café da manhã às 8h',
      'Mantenha-se hidratado durante o jejum',
      'Comece devagar e seja consistente',
      'Observe como seu corpo responde'
    ]
  },
  '14_10': {
    id: '14_10',
    name: 'Jejum Intermediário 14/10',
    subtitle: 'Equilíbrio perfeito',
    description: 'Você demonstrou boa capacidade de controle e rotina organizada. O protocolo 14/10 oferece benefícios consistentes sem ser muito desafiador.',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    readinessLevel: 'high',
    tips: [
      'Janela alimentar: 10h às 20h (ou 11h às 21h)',
      'Priorize proteínas na primeira refeição',
      'Café sem açúcar é liberado no jejum',
      'Aumente gradualmente se sentir conforto'
    ]
  },
  '16_8': {
    id: '16_8',
    name: 'Jejum Intermitente 16/8',
    subtitle: 'Protocolo mais popular',
    description: 'Parabéns! Seu perfil é excelente para o jejum 16/8, o protocolo mais estudado e eficaz para perda de peso, clareza mental e saúde metabólica.',
    icon: Flame,
    color: 'text-[#84cc16]',
    bgColor: 'bg-[#84cc16]/10',
    readinessLevel: 'high',
    tips: [
      'Janela alimentar: 12h às 20h (ou 13h às 21h)',
      'Quebrar o jejum com refeição balanceada',
      'Água, café e chá sem açúcar são permitidos',
      'Resultados visíveis em 2-3 semanas'
    ]
  },
  '18_6': {
    id: '18_6',
    name: 'Jejum Avançado 18/6',
    subtitle: 'Para resultados acelerados',
    description: 'Você demonstrou disciplina excepcional! O protocolo 18/6 é ideal para quem busca resultados mais rápidos e tem alta tolerância ao jejum.',
    icon: Zap,
    color: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    readinessLevel: 'high',
    tips: [
      'Janela alimentar: 14h às 20h (6 horas)',
      'Pode evoluir para OMAD (1 refeição/dia)',
      'Monitore energia e bem-estar',
      'Ideal para quem tem rotina fixa'
    ]
  }
};

export default function FastingResult() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [protocol, setProtocol] = useState<ProtocolInfo | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAssessment = async () => {
      try {
        const { data, error } = await supabase
          .from('fasting_assessments')
          .select('suggested_protocol, readiness_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data && data.suggested_protocol) {
          setProtocol(protocolsMap[data.suggested_protocol]);
          setReadinessScore(data.readiness_score || 50);
        } else {
          toast({
            title: '⚠️ Nenhuma avaliação encontrada',
            description: 'Complete o quiz primeiro para ver seu resultado.',
            variant: 'destructive',
          });
          navigate('/fasting-quiz');
        }
      } catch (error) {
        console.error('Error fetching fasting assessment:', error);
        toast({
          title: '❌ Erro ao carregar',
          description: 'Não foi possível carregar seu resultado.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] pb-32 bg-background relative">
        <div className="absolute inset-x-0 -top-[100px] h-[580px]">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="mx-auto max-w-lg relative">
          <div className="relative z-10 pt-20 px-4 space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!protocol) return null;

  const ProtocolIcon = protocol.icon;

  return (
    <div className="min-h-[100dvh] pb-32 bg-background relative">
      {/* Premium gradient header with depth */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="mx-auto max-w-lg relative">
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/fasting')}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <img src={logoImage} alt="Cari" className="h-6" />
            </div>
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          <main className="px-4 pt-6 space-y-4">
            {/* Protocol Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`h-16 w-16 rounded-2xl ${protocol.bgColor} flex items-center justify-center shrink-0`}>
                  <ProtocolIcon className={`h-8 w-8 ${protocol.color}`} />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {protocol.name}
                  </h1>
                  <p className={`text-sm font-medium ${protocol.color}`}>
                    {protocol.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-base text-muted-foreground leading-relaxed">
                {protocol.description}
              </p>
            </motion.div>

            {/* Readiness Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Nível de Prontidão
                </h2>
                <span className="text-2xl font-bold text-[#84cc16] tabular-nums">
                  {readinessScore}%
                </span>
              </div>
              <Progress value={readinessScore} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Preparação</span>
                <span>Intermediário</span>
                <span>Avançado</span>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-[#84cc16]" />
                <h2 className="text-lg font-semibold text-foreground">
                  {protocol.readinessLevel === 'low' ? 'Próximos Passos' : 'Como Começar'}
                </h2>
              </div>
              <ul className="space-y-3">
                {protocol.tips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#84cc16] shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {tip}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => navigate('/fasting')}
                className="w-full h-14 rounded-2xl font-semibold text-base press-effect"
              >
                {protocol.readinessLevel === 'low' ? 'Entendido, Voltar' : 'Iniciar Meu Jejum'}
              </Button>
            </motion.div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
