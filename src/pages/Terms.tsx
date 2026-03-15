import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

const Terms = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

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
            <img src={logoImage} alt="FastBurn" className="h-6" />
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

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4 mt-4"
          >
            <h1 className="text-2xl text-white font-semibold">Termos de Uso</h1>
            <p className="text-white/60 text-sm mt-1">Última atualização: 28 de novembro de 2025</p>
          </motion.div>

          {/* Content */}
          <main className="px-4 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card border border-border p-4"
            >
              <ScrollArea className="h-[calc(100dvh-320px)]">
                <div className="space-y-6 pr-4 text-sm leading-relaxed text-muted-foreground">
                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      1. Aceitação dos Termos
                    </h2>
                    <p>
                      Ao acessar e usar este aplicativo, você concorda em cumprir
                      estes Termos de Uso. Se você não concordar com qualquer parte
                      destes termos, não utilize o aplicativo.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      2. Descrição do Serviço
                    </h2>
                    <p>
                      O aplicativo fornece ferramentas para rastreamento de jejum
                      intermitente, registro de refeições e monitoramento de
                      métricas de saúde. O serviço é fornecido "como está" e não
                      constitui aconselhamento médico.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      3. Responsabilidade do Usuário
                    </h2>
                    <p className="mb-2">Você concorda em:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Fornecer informações precisas e atualizadas</li>
                      <li>Manter a confidencialidade de sua conta</li>
                      <li>Não usar o serviço para fins ilegais ou não autorizados</li>
                      <li>Consultar profissionais de saúde antes de mudanças dietéticas significativas</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      4. Isenção de Responsabilidade Médica
                    </h2>
                    <p>
                      Este aplicativo não substitui orientação médica profissional.
                      Consulte sempre um profissional de saúde qualificado antes de
                      iniciar qualquer programa de jejum ou mudança dietética.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      5. Propriedade Intelectual
                    </h2>
                    <p>
                      Todo o conteúdo, design e funcionalidades do aplicativo são de
                      propriedade exclusiva ou licenciados para uso. Você não pode
                      copiar, modificar ou distribuir qualquer parte sem autorização
                      expressa.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      6. Limitação de Responsabilidade
                    </h2>
                    <p>
                      Não nos responsabilizamos por danos diretos, indiretos,
                      incidentais ou consequenciais decorrentes do uso ou
                      incapacidade de usar o aplicativo.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      7. Modificações do Serviço
                    </h2>
                    <p>
                      Reservamos o direito de modificar ou descontinuar o serviço a
                      qualquer momento, com ou sem aviso prévio. Não seremos
                      responsáveis por qualquer modificação, suspensão ou
                      descontinuação do serviço.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      8. Rescisão
                    </h2>
                    <p>
                      Podemos encerrar ou suspender sua conta imediatamente, sem
                      aviso prévio, por violação destes Termos de Uso.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      9. Lei Aplicável
                    </h2>
                    <p>
                      Estes termos são regidos pelas leis do Brasil. Quaisquer
                      disputas serão resolvidas nos tribunais brasileiros
                      competentes.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      10. Contato
                    </h2>
                    <p>
                      Para dúvidas sobre estes Termos de Uso, entre em contato
                      através do e-mail: contato@fastburn.com.br
                    </p>
                  </section>
                </div>
              </ScrollArea>
            </motion.div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Terms;
