import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { FitCoinIcon } from '@/components/FitCoinIcon';
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function FitCoinHistory() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchTransactions();

    // Real-time subscription
    const channel = supabase
      .channel('fitcoin-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="pt-20 px-4 pb-6">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Voltar</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">Histórico de FitCoins</h1>
          <p className="text-muted-foreground">
            Veja todas as suas transações de FitCoins
          </p>
        </motion.div>

        {/* Current Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mt-6 p-6 bg-gradient-to-br from-teal-500/10 to-violet-500/10 border-teal-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                <div className="flex items-center gap-2">
                  <FitCoinIcon size={28} />
                  <span className="text-4xl font-bold text-foreground">
                    {profile?.token_balance || 0}
                  </span>
                  <span className="text-lg text-muted-foreground">FitCoins</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-teal-400" />
              </div>
            </div>
          </Card>
        </motion.div>
        </div>

        {/* Transactions List */}
        <div className="px-4 space-y-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))
        ) : transactions.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FitCoinIcon size={40} className="opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma transação ainda
            </h3>
            <p className="text-sm text-muted-foreground">
              Suas transações de FitCoins aparecerão aqui
            </p>
          </motion.div>
        ) : (
          // Transactions
          transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 bg-card border-border hover:border-muted-foreground/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      transaction.amount > 0 
                        ? "bg-teal-500/20" 
                        : "bg-violet-500/20"
                    )}>
                      {transaction.amount > 0 ? (
                        <TrendingUp className="h-5 w-5 text-teal-400" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-violet-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "text-lg font-bold",
                      transaction.amount > 0 ? "text-teal-400" : "text-foreground"
                    )}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                    <FitCoinIcon size={16} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
