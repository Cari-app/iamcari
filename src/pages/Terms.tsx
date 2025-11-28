import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
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
          <h1 className="text-2xl font-bold text-slate-50">Termos de Uso</h1>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100dvh-8rem)]">
          <div className="space-y-6 pr-4 text-base leading-relaxed">
            <p className="text-slate-400 text-sm">
              Última atualização: 28 de novembro de 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e usar este aplicativo, você concorda em cumprir
                estes Termos de Uso. Se você não concordar com qualquer parte
                destes termos, não utilize o aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                3. Responsabilidade do Usuário
              </h2>
              <p className="mb-2">Você concorda em:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>
                  Não usar o serviço para fins ilegais ou não autorizados
                </li>
                <li>Consultar profissionais de saúde antes de mudanças dietéticas significativas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                4. Isenção de Responsabilidade Médica
              </h2>
              <p>
                Este aplicativo não substitui orientação médica profissional.
                Consulte sempre um profissional de saúde qualificado antes de
                iniciar qualquer programa de jejum ou mudança dietética.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                6. Limitação de Responsabilidade
              </h2>
              <p>
                Não nos responsabilizamos por danos diretos, indiretos,
                incidentais ou consequenciais decorrentes do uso ou
                incapacidade de usar o aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
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
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                8. Rescisão
              </h2>
              <p>
                Podemos encerrar ou suspender sua conta imediatamente, sem
                aviso prévio, por violação destes Termos de Uso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                9. Lei Aplicável
              </h2>
              <p>
                Estes termos são regidos pelas leis do Brasil. Quaisquer
                disputas serão resolvidas nos tribunais brasileiros
                competentes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-50 mb-3">
                10. Contato
              </h2>
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato
                através do e-mail: [seu email de contato]
              </p>
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Terms;
