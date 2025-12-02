import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { BalanceCard } from '@/components/fitcoin/BalanceCard';
import { TransactionList } from '@/components/fitcoin/TransactionList';

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

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      
      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="pt-24 px-4 pb-6">
          <motion.button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 press-effect group"
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 mb-8"
          >
            <h1 className="text-4xl font-bold gradient-text">
              Histórico de FitCoins
            </h1>
            <p className="text-muted-foreground text-sm">
              Acompanhe todas as suas transações e uso de IA
            </p>
          </motion.div>

          {/* Current Balance Card */}
          <BalanceCard balance={profile?.token_balance || 0} />
        </div>

        {/* Transactions Section */}
        <div className="px-4 space-y-4">
          {!loading && transactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Transações Recentes
              </h2>
              <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
              </span>
            </motion.div>
          )}
          
          <TransactionList transactions={transactions} loading={loading} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
