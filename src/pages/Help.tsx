import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  Mail, 
  FileQuestion, 
  Sparkles,
  ExternalLink,
  BookOpen,
  HelpCircle,
  User,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Help() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const whatsappNumber = "5533999999999";

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Olá! Preciso de ajuda com o Cari.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:suporte@cari.com.br?subject=Preciso de Ajuda";
  };

  const faqItems = [
    {
      question: "Como funciona a análise de refeições com IA?",
      answer: "Tire uma foto da sua refeição e a Cari (nossa IA) analisa automaticamente as calorias e macros."
    },
    {
      question: "Como funciona o jejum intermitente?",
      answer: "O jejum intermitente alterna períodos de alimentação e jejum. Complete o quiz para descobrir o protocolo ideal para você."
    },
    {
      question: "Posso registrar refeições manualmente?",
      answer: "Sim! Você pode adicionar refeições manualmente informando o nome e as calorias estimadas."
    },
    {
      question: "Como acompanho meu progresso?",
      answer: "Na página de Progresso você vê seu histórico de atividades, sequência de dias ativos e estatísticas gerais."
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background pb-24 relative overflow-hidden">
      {/* Green Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[#22c55e] to-[#16a34a] -z-10" />

      {/* Header */}
      <header 
        className="px-4 flex items-center justify-between"
        style={{ 
          paddingTop: isMobile 
            ? 'calc(1rem + env(safe-area-inset-top, 0px))' 
            : '1rem' 
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="xs" forceDark />
        </div>
        <button onClick={() => navigate('/profile')} className="press-effect">
          <Avatar className="h-10 w-10 ring-2 ring-white/30">
            <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
            <AvatarFallback className="bg-white/20">
              <User className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>
        </button>
      </header>
      
      <main className="px-4 pt-6 relative">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Central de Ajuda
            </h1>
            <p className="text-white/80">
              Como podemos te ajudar hoje?
            </p>
          </motion.div>

          {/* Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 gap-4"
          >
            <Card className="border border-border bg-card hover:border-primary/30 transition-all cursor-pointer press-effect rounded-2xl"
                  onClick={handleWhatsAppSupport}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Fale com a Equipe
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Suporte via WhatsApp
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card hover:border-primary/30 transition-all cursor-pointer press-effect rounded-2xl"
                  onClick={handleEmailSupport}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Email de Suporte
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      suporte@cari.com.br
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Card className="border border-border bg-card rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-foreground flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-primary mt-1 shrink-0" />
                        {item.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Links Úteis
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate('/terms')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 press-effect rounded-2xl"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Termos de Uso</span>
              </Button>

              <Button
                onClick={() => navigate('/privacy')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 press-effect rounded-2xl"
              >
                <FileQuestion className="h-5 w-5" />
                <span className="text-sm">Privacidade</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
