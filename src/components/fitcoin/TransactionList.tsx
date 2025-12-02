import { Skeleton } from '@/components/ui/skeleton';
import { FitCoinIcon } from '@/components/FitCoinIcon';
import { TransactionCard } from './TransactionCard';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Skeleton className="h-20 rounded-2xl bg-muted/10 backdrop-blur-sm animate-pulse" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="text-center py-20"
      >
        <motion.div 
          className="relative inline-flex mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
          <div className="relative h-24 w-24 rounded-2xl glass border border-border/50 flex items-center justify-center">
            <FitCoinIcon size={48} className="opacity-50" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Nenhuma transação ainda
        </h3>
        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
          Suas transações de FitCoins aparecerão aqui quando você comprar ou usar
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <TransactionCard
          key={transaction.id}
          amount={transaction.amount}
          description={transaction.description}
          createdAt={transaction.created_at}
          index={index}
        />
      ))}
    </div>
  );
}
