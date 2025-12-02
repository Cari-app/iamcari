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
import { toast } from "@/hooks/use-toast";
const Plans = () => {
  const {
    user
  } = useAuth();
  const plans = [{
    id: "trial",
    name: "Trial",
    badge: "Iniciante",
    subtitle: "O Começo",
    price: "27,00",
    fitcoins: 30,
    features: ["Diário Inteligente", "Acesso Básico à Dona", "Análise de Jejum", "Suporte via Email"],
    checkoutUrl: "", // TODO: INSERT STRIPE CHECKOUT LINK FOR TRIAL PLAN
    highlighted: false,
    tier: "trial"
  }, {
    id: "vip",
    name: "VIP",
    badge: "Mais Popular",
    subtitle: "O Destaque",
    price: "67,00",
    fitcoins: 80,
    features: ["Diário Inteligente", "Acesso à Dona (WhatsApp)", "Análise de Jejum Avançada", "Suporte Prioritário", "Acesso Antecipado a Features"],
    checkoutUrl: "", // TODO: INSERT STRIPE CHECKOUT LINK FOR VIP PLAN
    highlighted: true,
    tier: "vip"
  }, {
    id: "premium",
    name: "Premium",
    badge: "Power User",
    subtitle: "O Poderoso",
    price: "97,00",
    fitcoins: 190,
    features: ["Diário Inteligente", "Acesso à Dona (WhatsApp)", "Análise de Jejum Avançada", "Suporte Prioritário", "Acesso Ilimitado a Novas Features", "Consultoria Mensal"],
    checkoutUrl: "", // TODO: INSERT STRIPE CHECKOUT LINK FOR PREMIUM PLAN
    highlighted: false,
    tier: "premium"
  }];
  const handleSelectPlan = (plan: typeof plans[0]) => {
    if (!plan.checkoutUrl) {
      console.warn("⚠️ Checkout URL not configured for plan:", plan.tier);
      toast({
        title: '🚧 Em breve',
        description: 'Checkout em desenvolvimento. Entre em contato para assinar.',
      });
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

  // Reorder for mobile: VIP first
  const mobilePlans = [plans.find(p => p.id === "vip")!, plans.find(p => p.id === "trial")!, plans.find(p => p.id === "premium")!];
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      
      <main className="container max-w-6xl mx-auto px-4 pt-[180px] pb-32 md:pb-20">
        {/* Hero Section - Minimalista */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-20 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Potencialize sua Jornada
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tenha a inteligência da Dona e a visão computacional trabalhando por você 24h por dia.
          </p>
        </motion.div>

        {/* Desktop: 3 Column Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => <motion.div key={plan.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
              <Card className={cn("relative h-full bg-card border transition-all duration-200 hover:border-primary/30", plan.highlighted && "border-primary/40 shadow-sm")}>
                {/* Badge Simples */}
                {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant={plan.highlighted ? "default" : "secondary"} className={cn("px-3 py-0.5 text-xs", plan.highlighted && "bg-primary text-primary-foreground")}>
                      {plan.badge}
                    </Badge>
                  </div>}

                <CardHeader className="text-center pb-6 pt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    {plan.subtitle}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-base text-muted-foreground">R$</span>
                      <span className="text-5xl font-bold tabular-nums text-foreground">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">/mês</p>
                  </div>

                  {/* FitCoins - Simples */}
                  <div className="py-3 px-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <FitCoinIcon size={20} />
                      <span className="text-2xl font-bold text-foreground tabular-nums">
                        {plan.fitcoins}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      FitCoins / mês
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-6 pb-6">
                  {plan.features.map((feature, idx) => <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </div>)}
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button onClick={() => handleSelectPlan(plan)} className={cn("w-full h-11 font-medium transition-all", plan.highlighted && "bg-primary text-primary-foreground hover:bg-primary/90")} variant={plan.highlighted ? "default" : "outline"}>
                    {plan.tier === "trial" && "Experimentar"}
                    {plan.tier === "vip" && "Escolher VIP"}
                    {plan.tier === "premium" && "Escolher Premium"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>)}
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="md:hidden space-y-6 mb-16">
          {mobilePlans.map((plan, index) => <motion.div key={plan.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
              <Card className={cn("relative bg-card border transition-all", plan.highlighted && "border-primary/40 shadow-sm")}>
                {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant={plan.highlighted ? "default" : "secondary"} className={cn("px-3 py-0.5 text-xs", plan.highlighted && "bg-primary text-primary-foreground")}>
                      {plan.badge}
                    </Badge>
                  </div>}

                <CardHeader className="text-center pb-6 pt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-6">
                    {plan.subtitle}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-base text-muted-foreground">R$</span>
                      <span className="text-5xl font-bold tabular-nums text-foreground">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">/mês</p>
                  </div>

                  <div className="py-3 px-4 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                      <FitCoinIcon size={20} />
                      <span className="text-2xl font-bold text-foreground tabular-nums">
                        {plan.fitcoins}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      FitCoins / mês
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 px-6 pb-6">
                  {plan.features.map((feature, idx) => <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/80">
                        {feature}
                      </span>
                    </div>)}
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button onClick={() => handleSelectPlan(plan)} className={cn("w-full h-11 font-medium transition-all", plan.highlighted && "bg-primary text-primary-foreground hover:bg-primary/90")} variant={plan.highlighted ? "default" : "outline"}>
                    {plan.tier === "trial" && "Experimentar"}
                    {plan.tier === "vip" && "Escolher VIP"}
                    {plan.tier === "premium" && "Escolher Premium"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>)}
        </div>

        {/* Trust Footer - Minimalista */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Pagamento seguro via Stripe • Cancele a qualquer momento</span>
          </div>
          
          <button onClick={handleRestorePurchases} className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline-offset-4 hover:underline flex items-center gap-1.5 mx-auto">
            <RefreshCw className="h-3 w-3" />
            Restaurar Compras
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>;
};
export default Plans;