import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";

const Plans = () => {
  const { user } = useAuth();

  const plans = [
    {
      id: "trial",
      name: "Trial",
      subtitle: "Iniciante",
      price: "27,00",
      fitcoins: 30,
      description: "Para quem quer testar a tecnologia.",
      checkoutUrl: "", // Will be added later
      highlighted: false,
      premium: false,
    },
    {
      id: "vip",
      name: "VIP",
      subtitle: "Recomendado",
      price: "67,00",
      fitcoins: 80,
      description: "O equilíbrio ideal para sua rotina diária.",
      checkoutUrl: "", // Will be added later
      highlighted: true,
      premium: false,
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Power User",
      price: "97,00",
      fitcoins: 190,
      description: "Máxima potência. Quase 2x mais moedas pelo valor.",
      checkoutUrl: "", // Will be added later
      highlighted: false,
      premium: true,
    },
  ];

  const features = [
    "Acesso à Dona (WhatsApp)",
    "Diário Inteligente",
    "Análise de Jejum",
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (!plan.checkoutUrl) {
      console.log("Checkout URL will be configured later");
      return;
    }
    
    // Build URL with user email as query param
    const checkoutUrl = new URL(plan.checkoutUrl);
    if (user?.email) {
      checkoutUrl.searchParams.set("email", user.email);
    }
    window.open(checkoutUrl.toString(), "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Escolha Seu Plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Todos os planos incluem acesso completo às funcionalidades. 
            A diferença está na quantidade de FitCoins para análises com IA.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105
                ${plan.highlighted 
                  ? "glass border-2 border-primary shadow-lg glow-violet" 
                  : plan.premium
                  ? "glass border-2 border-yellow-500/50 shadow-lg"
                  : "glass hover:border-border/50"
                }
              `}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute top-4 right-4">
                  <Badge className="gradient-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}

              {plan.premium && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                    ⚡ Premium
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="space-y-1 mb-2">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {plan.subtitle}
                  </p>
                </div>
                
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className={`text-5xl font-bold tabular-nums ${
                      plan.highlighted ? "gradient-text" : ""
                    }`}>
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>

                {/* FitCoins */}
                <div className={`
                  mt-4 py-3 px-4 rounded-lg 
                  ${plan.premium 
                    ? "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20"
                    : plan.highlighted
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 border border-border"
                  }
                `}>
                  <div className="text-3xl font-bold gradient-text">
                    {plan.fitcoins} FitCoins
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créditos mensais para IA
                  </p>
                </div>

                <CardDescription className="mt-4 text-center min-h-[3rem] flex items-center justify-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pb-4">
                {/* Features List */}
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`
                        mt-0.5 rounded-full p-1
                        ${plan.highlighted 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                        }
                      `}>
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className={`
                    w-full transition-all duration-200
                    ${plan.highlighted
                      ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-md"
                      : plan.premium
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:opacity-90 shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    }
                  `}
                  size="lg"
                >
                  Escolher {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            💡 <strong>FitCoins</strong> renovam mensalmente no modelo "Use ou Perca"
          </p>
          <p className="text-xs text-muted-foreground">
            Pagamento 100% seguro via Kiwify • Cancele quando quiser
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Plans;
