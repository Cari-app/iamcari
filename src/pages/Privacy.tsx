import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-300">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-50">
            Política de Privacidade
          </h1>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100dvh-8rem)]">
          <div className="space-y-6 pr-4 text-base leading-relaxed">
            <p className="text-slate-400 text-sm">
              Última atualização: 28 de novembro de 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                1. Introdução
              </h2>
              <p>
                Esta Política de Privacidade descreve como coletamos, usamos e
                protegemos suas informações pessoais em conformidade com a Lei
                Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                2. Dados Coletados
              </h2>
              <p className="mb-2">Coletamos as seguintes informações:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Endereço de e-mail</li>
                <li>Nome completo</li>
                <li>Foto de perfil</li>
                <li>Dados biométricos (peso, altura, idade)</li>
                <li>Registros de jejum e refeições</li>
                <li>Fotos de alimentos (quando fornecidas)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                5. Segurança
              </h2>
              <p>
                Implementamos medidas técnicas e organizacionais para proteger
                seus dados contra acesso não autorizado, perda ou divulgação
                indevida.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                6. Seus Direitos (LGPD)
              </h2>
              <p className="mb-2">Você tem direito a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar anonimização ou exclusão</li>
                <li>Revogar consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                7. Retenção de Dados
              </h2>
              <p>
                Seus dados são mantidos enquanto sua conta estiver ativa. Você
                pode solicitar a exclusão de sua conta e dados a qualquer
                momento através das configurações do perfil.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                8. Contato
              </h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre esta
                política, entre em contato através do e-mail: [seu email de
                contato]
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Privacy;
