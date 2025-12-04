import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import logoImage from "@/assets/logo-cari.png";

const Privacy = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <img src={logoImage} alt="Cari" className="h-8" />
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
            <h1 className="text-2xl text-white font-semibold">Política de Privacidade</h1>
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
                      1. Introdução
                    </h2>
                    <p>
                      Esta Política de Privacidade descreve como coletamos, usamos e
                      protegemos suas informações pessoais em conformidade com a Lei
                      Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      2. Dados Coletados
                    </h2>
                    <p className="mb-2">Coletamos as seguintes informações:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Endereço de e-mail</li>
                      <li>Nome completo</li>
                      <li>Foto de perfil</li>
                      <li>Dados biométricos (peso, altura, idade)</li>
                      <li>Registros de jejum e refeições</li>
                      <li>Fotos de alimentos (quando fornecidas)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      3. Finalidade do Tratamento
                    </h2>
                    <p>
                      Utilizamos seus dados para fornecer funcionalidades do
                      aplicativo, incluindo rastreamento de jejum intermitente,
                      registro de refeições, cálculo de métricas de saúde e
                      personalização da experiência do usuário.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      4. Compartilhamento de Dados
                    </h2>
                    <p>
                      Seus dados não são compartilhados com terceiros para fins
                      comerciais. Utilizamos serviços de infraestrutura (Supabase)
                      para armazenamento seguro, que estão sujeitos às suas próprias
                      políticas de privacidade.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      5. Segurança
                    </h2>
                    <p>
                      Implementamos medidas técnicas e organizacionais para proteger
                      seus dados contra acesso não autorizado, perda ou divulgação
                      indevida.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      6. Seus Direitos (LGPD)
                    </h2>
                    <p className="mb-2">Você tem direito a:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Confirmar a existência de tratamento de dados</li>
                      <li>Acessar seus dados pessoais</li>
                      <li>Corrigir dados incompletos ou desatualizados</li>
                      <li>Solicitar anonimização ou exclusão</li>
                      <li>Revogar consentimento</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      7. Retenção de Dados
                    </h2>
                    <p>
                      Seus dados são mantidos enquanto sua conta estiver ativa. Você
                      pode solicitar a exclusão de sua conta e dados a qualquer
                      momento através das configurações do perfil.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      8. Contato
                    </h2>
                    <p>
                      Para exercer seus direitos ou esclarecer dúvidas sobre esta
                      política, entre em contato através do e-mail: contato@cari.com.br
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

export default Privacy;
