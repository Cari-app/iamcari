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
          <Skeleton key={i} className="h-20 rounded-2xl bg-muted/20" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="h-20 w-20 rounded-full bg-muted/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border border-border/50">
          <FitCoinIcon size={40} className="opacity-50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhuma transação ainda
        </h3>
        <p className="text-sm text-muted-foreground">
          Suas transações de FitCoins aparecerão aqui
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
