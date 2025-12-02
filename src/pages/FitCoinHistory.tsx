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
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-20 px-4 pb-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 press-effect"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-6"
          >
            <h1 className="text-3xl font-bold gradient-text">Histórico de FitCoins</h1>
            <p className="text-muted-foreground text-sm">
              Veja todas as suas transações de FitCoins
            </p>
          </motion.div>

          {/* Current Balance Card */}
          <BalanceCard balance={profile?.token_balance || 0} />
        </div>

        {/* Transactions List */}
        <div className="px-4">
          <TransactionList transactions={transactions} loading={loading} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
