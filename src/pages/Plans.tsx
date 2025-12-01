import { Check, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { motion } from "framer-motion";
import { FitCoinIcon } from "@/components/FitCoinIcon";
import { cn } from "@/lib/utils";

const Plans = () => {
  const { user } = useAuth();

  const plans = [
    {
      id: "trial",
      name: "Trial",
      badge: "Iniciante",
      subtitle: "O Começo",
      price: "27,00",
      fitcoins: 30,
      description: "Para quem quer testar a tecnologia.",
      features: [
        "Diário Inteligente",
        "Acesso Básico à Dona",
        "Análise de Jejum",
        "Suporte via Email",
      ],
      checkoutUrl: "",
      highlighted: false,
      tier: "trial",
    },
    {
      id: "vip",
      name: "VIP",
      badge: "Mais Popular",
      subtitle: "O Destaque",
      price: "67,00",
      fitcoins: 80,
      description: "O equilíbrio ideal para sua rotina diária.",
      features: [
        "Diário Inteligente",
        "Acesso à Dona (WhatsApp)",
        "Análise de Jejum Avançada",
        "Suporte Prioritário",
        "Acesso Antecipado a Features",
      ],
      checkoutUrl: "",
      highlighted: true,
      tier: "vip",
    },
    {
      id: "premium",
      name: "Premium",
      badge: "Power User",
      subtitle: "O Poderoso",
      price: "97,00",
      fitcoins: 190,
      description: "Máxima potência. Quase 2x mais moedas pelo valor.",
      highlight: "Melhor Custo-Benefício",
      features: [
        "Diário Inteligente",
        "Acesso à Dona (WhatsApp)",
        "Análise de Jejum Avançada",
        "Suporte Prioritário",
        "Acesso Ilimitado a Novas Features",
        "Consultoria Mensal",
      ],
      checkoutUrl: "",
      highlighted: false,
      tier: "premium",
    },
  ];

  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (!plan.checkoutUrl) {
      console.log("Checkout URL will be configured later");
      return;
    }
    
    const checkoutUrl = new URL(plan.checkoutUrl);
    if (user?.email) {
      checkoutUrl.searchParams.set("email", user.email);
    }
    window.open(checkoutUrl.toString(), "_blank");
  };

  const handleRestorePurchases = () => {
    console.log("Restore purchases functionality");
  };

  // Reorder plans for mobile: VIP first
  const mobilePlans = [
    plans.find(p => p.id === "vip")!,
    plans.find(p => p.id === "trial")!,
    plans.find(p => p.id === "premium")!,
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Glow Background Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      <main className="container max-w-7xl mx-auto px-4 py-12 pb-28 md:pb-12 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          {/* Headline with Gradient */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold gradient-text leading-tight">
            Potencialize sua Jornada
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tenha a inteligência da Dona e a visão computacional trabalhando por você{" "}
            <span className="text-primary font-semibold">24h por dia</span>.
          </p>
        </motion.div>

        {/* Desktop: 3 Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative h-full backdrop-blur-xl bg-card/50 border-2 transition-all duration-300 hover:scale-[1.02]",
                  plan.highlighted && "border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.3)] md:scale-105",
                  plan.tier === "premium" && "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
                  !plan.highlighted && plan.tier !== "premium" && "border-border/50"
                )}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gradient-primary text-white px-4 py-1 text-xs font-bold shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {plan.tier === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 text-xs font-bold shadow-lg border-0">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {plan.tier === "trial" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="secondary" className="px-4 py-1 text-xs font-bold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.subtitle}
                  </p>
                  
                  {/* Price */}
                  <div className="space-y-1 mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span className={cn(
                        "text-5xl lg:text-6xl font-extrabold tabular-nums",
                        plan.highlighted && "gradient-text"
                      )}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>

                  {/* FitCoins */}
                  <div className={cn(
                    "py-4 px-5 rounded-2xl border-2",
                    plan.tier === "premium" && "bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30",
                    plan.highlighted && "bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30",
                    plan.tier === "trial" && "bg-muted/30 border-border/50"
                  )}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <FitCoinIcon size={28} />
                      <span className="text-4xl font-extrabold text-foreground tabular-nums">
                        {plan.fitcoins}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FitCoins / mês
                    </p>
                    {plan.highlight && (
                      <p className="text-xs font-semibold text-amber-400 mt-2">
                        {plan.highlight}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 rounded-full p-1 shrink-0",
                          plan.highlighted && "bg-primary/20 text-primary",
                          plan.tier === "premium" && "bg-amber-500/20 text-amber-400",
                          plan.tier === "trial" && "bg-muted text-muted-foreground"
                        )}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-foreground/90">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      "w-full h-12 rounded-2xl font-semibold text-base transition-all duration-300",
                      plan.highlighted && "gradient-primary text-white hover:opacity-90 shadow-lg animate-pulse-slow",
                      plan.tier === "premium" && "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90 shadow-lg",
                      plan.tier === "trial" && "border-2 border-border bg-transparent text-foreground hover:bg-accent"
                    )}
                    variant={plan.tier === "trial" ? "outline" : "default"}
                  >
                    {plan.tier === "trial" && "Experimentar"}
                    {plan.tier === "vip" && "Quero ser VIP"}
                    {plan.tier === "premium" && "Virar Premium"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Vertical Stack (VIP First) */}
        <div className="md:hidden space-y-6 mb-12">
          {mobilePlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative backdrop-blur-xl bg-card/50 border-2 transition-all duration-300",
                  plan.highlighted && "border-primary/50 shadow-[0_0_40px_rgba(139,92,246,0.3)]",
                  plan.tier === "premium" && "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
                  !plan.highlighted && plan.tier !== "premium" && "border-border/50"
                )}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="gradient-primary text-white px-4 py-1 text-xs font-bold shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {plan.tier === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 text-xs font-bold shadow-lg border-0">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {plan.tier === "trial" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="secondary" className="px-4 py-1 text-xs font-bold">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.subtitle}
                  </p>
                  
                  <div className="space-y-1 mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-muted-foreground">R$</span>
                      <span className={cn(
                        "text-5xl font-extrabold tabular-nums",
                        plan.highlighted && "gradient-text"
                      )}>
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>

                  <div className={cn(
                    "py-4 px-5 rounded-2xl border-2",
                    plan.tier === "premium" && "bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/30",
                    plan.highlighted && "bg-gradient-to-br from-primary/10 to-primary/20 border-primary/30",
                    plan.tier === "trial" && "bg-muted/30 border-border/50"
                  )}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <FitCoinIcon size={28} />
                      <span className="text-4xl font-extrabold text-foreground tabular-nums">
                        {plan.fitcoins}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      FitCoins / mês
                    </p>
                    {plan.highlight && (
                      <p className="text-xs font-semibold text-amber-400 mt-2">
                        {plan.highlight}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5 rounded-full p-1 shrink-0",
                          plan.highlighted && "bg-primary/20 text-primary",
                          plan.tier === "premium" && "bg-amber-500/20 text-amber-400",
                          plan.tier === "trial" && "bg-muted text-muted-foreground"
                        )}>
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-foreground/90">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={cn(
                      "w-full h-12 rounded-2xl font-semibold text-base transition-all duration-300",
                      plan.highlighted && "gradient-primary text-white hover:opacity-90 shadow-lg animate-pulse-slow",
                      plan.tier === "premium" && "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-90 shadow-lg",
                      plan.tier === "trial" && "border-2 border-border bg-transparent text-foreground hover:bg-accent"
                    )}
                    variant={plan.tier === "trial" ? "outline" : "default"}
                  >
                    {plan.tier === "trial" && "Experimentar"}
                    {plan.tier === "vip" && "Quero ser VIP"}
                    {plan.tier === "premium" && "Virar Premium"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-teal-500" />
            <span>Pagamento seguro via Kiwify</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Cancele a qualquer momento</span>
          </div>
          
          <button
            onClick={handleRestorePurchases}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors underline-offset-4 hover:underline flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Restaurar Compras
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Plans;
