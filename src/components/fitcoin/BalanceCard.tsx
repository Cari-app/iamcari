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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass p-6 border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-background/50 to-violet-500/10 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
            <div className="flex items-center gap-2">
              <FitCoinIcon size={28} />
              <span className="text-4xl font-bold text-foreground">
                {balance}
              </span>
              <span className="text-lg text-muted-foreground">FitCoins</span>
            </div>
          </div>
          <div className="h-16 w-16 rounded-full bg-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-teal-500/30">
            <Sparkles className="h-8 w-8 text-teal-400" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
