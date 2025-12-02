import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FitCoinIcon } from '@/components/FitCoinIcon';

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-violet-500/20 blur-xl rounded-3xl" />
      
      <Card className="relative glass border-teal-500/30 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-violet-500/5 to-background opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-teal-400 uppercase tracking-wider">Saldo Disponível</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold gradient-text">
                  {balance}
                </span>
                <span className="text-sm text-muted-foreground font-medium">FitCoins</span>
              </div>
            </div>
            
            <motion.div 
              className="relative"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500/30 to-violet-500/30 backdrop-blur-sm flex items-center justify-center border border-teal-400/30 shadow-lg shadow-teal-500/20">
                <Sparkles className="h-7 w-7 text-teal-400" />
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <FitCoinIcon size={16} />
            <span className="text-xs text-muted-foreground">Use para análises de IA</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
