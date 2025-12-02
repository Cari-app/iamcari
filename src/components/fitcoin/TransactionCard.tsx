import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FitCoinIcon } from '@/components/FitCoinIcon';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  amount: number;
  description: string;
  createdAt: string;
  index: number;
}

export function TransactionCard({ amount, description, createdAt, index }: TransactionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "relative glass p-4 border-border/50 hover:border-border transition-all duration-300 overflow-hidden group cursor-pointer",
        amount > 0 && "hover:border-teal-500/30",
        amount < 0 && "hover:border-violet-500/30"
      )}>
        {/* Hover glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          amount > 0 && "bg-gradient-to-r from-teal-500/5 to-transparent",
          amount < 0 && "bg-gradient-to-r from-violet-500/5 to-transparent"
        )} />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "h-11 w-11 rounded-xl flex items-center justify-center backdrop-blur-sm relative",
                amount > 0 
                  ? "bg-teal-500/20 border border-teal-500/30 shadow-lg shadow-teal-500/20" 
                  : "bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/20"
              )}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              {amount > 0 ? (
                <TrendingUp className="h-5 w-5 text-teal-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-violet-400" />
              )}
            </motion.div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {description}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-lg font-bold tabular-nums",
              amount > 0 ? "text-teal-400" : "text-foreground"
            )}>
              {amount > 0 ? '+' : ''}{amount}
            </span>
            <FitCoinIcon size={18} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
