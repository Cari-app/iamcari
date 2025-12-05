import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Mail, 
  FileQuestion, 
  Sparkles,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-cari.png';

export default function Help() {
  const navigate = useNavigate();
  const { profile } = useAuth();
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
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-6" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/profile">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
      
          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4 mt-4"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl text-white font-semibold">Central de Ajuda</h2>
            <p className="text-white/60 text-sm mt-1">Como podemos te ajudar hoje?</p>
          </motion.div>

          <main className="px-4 pt-6 space-y-4">
            {/* Contact Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <Card className="border border-border bg-card hover:border-[#84cc16]/30 transition-all cursor-pointer press-effect rounded-2xl"
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

              <Card className="border border-border bg-card hover:border-[#84cc16]/30 transition-all cursor-pointer press-effect rounded-2xl"
                    onClick={handleEmailSupport}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-[#84cc16]" />
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
                <FileQuestion className="h-5 w-5 text-[#84cc16]" />
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
                          <Sparkles className="h-4 w-4 text-[#84cc16] mt-1 shrink-0" />
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
          </main>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
