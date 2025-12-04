import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
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
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();
  const whatsappNumber = "5533999999999"; // TODO: INSERT SUPPORT WHATSAPP NUMBER

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
      answer: "Tire uma foto da sua refeição e a Cari (nossa IA) analisa automaticamente as calorias e macros. Consome 1 FitCoin por análise."
    },
    {
      question: "O que são FitCoins?",
      answer: "FitCoins são a moeda do app usada para análises de IA. Você recebe FitCoins ao assinar um plano."
    },
    {
      question: "Como funciona o sistema de gamificação?",
      answer: "Complete jejuns e ganhe XP. A cada 1000 XP você sobe de nível e ganha 10 GameCoins. Mantenha sua sequência ativa!"
    },
    {
      question: "Posso cancelar minha assinatura?",
      answer: "Sim, você pode cancelar a qualquer momento. Seus dados permanecerão salvos caso queira voltar."
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background pb-24 safe-pt-navbar relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      
      <main className="px-4 py-6 relative">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-violet">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Central de Ajuda
            </h1>
            <p className="text-muted-foreground">
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
            <Card className="glass-card border-border/30 hover:border-primary/30 transition-all cursor-pointer press-effect"
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

            <Card className="glass-card border-border/30 hover:border-primary/30 transition-all cursor-pointer press-effect"
                  onClick={handleEmailSupport}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-violet-400" />
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
                  <Card className="glass-card border-border/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold text-foreground flex items-start gap-2">
                        <Sparkles className="h-4 w-4 text-teal-400 mt-1 shrink-0" />
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
                className="h-auto py-4 flex flex-col items-center gap-2 press-effect"
              >
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Termos de Uso</span>
              </Button>

              <Button
                onClick={() => navigate('/privacy')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 press-effect"
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
