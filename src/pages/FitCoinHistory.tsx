import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { BalanceCard } from '@/components/fitcoin/BalanceCard';
import { TransactionList } from '@/components/fitcoin/TransactionList';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FitCoinIcon } from '@/components/FitCoinIcon';

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
  const [customAmount, setCustomAmount] = useState<number[]>([10]);

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
        <div className="pt-32 px-4 pb-6">
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

        {/* Purchase Plans Section */}
        <div className="px-4 space-y-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Comprar FitCoins
            </h2>
            <p className="text-muted-foreground text-sm">
              Escolha um pacote ou defina uma quantidade personalizada
            </p>
          </motion.div>

          {/* Fixed Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Plan 10 FitCoins */}
            <Card className="glass-card border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <FitCoinIcon size={32} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-xs text-muted-foreground">FitCoins</p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-lg font-bold text-violet-400">R$ 9,00</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Plan 50 FitCoins */}
            <Card className="glass-card border-teal-500/20 hover:border-teal-500/40 transition-all cursor-pointer group overflow-hidden relative scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 bg-teal-500 text-xs px-2 py-0.5 rounded-bl-lg font-medium">
                Popular
              </div>
              <div className="p-4 relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <FitCoinIcon size={32} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">50</p>
                  <p className="text-xs text-muted-foreground">FitCoins</p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-lg font-bold text-teal-400">R$ 47,00</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Plan 100 FitCoins */}
            <Card className="glass-card border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <FitCoinIcon size={32} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold">100</p>
                  <p className="text-xs text-muted-foreground">FitCoins</p>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-lg font-bold text-violet-400">R$ 79,90</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Custom Amount Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-border/30 p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Quantidade Personalizada
                  </h3>
                  <div className="flex items-center gap-2">
                    <FitCoinIcon size={20} />
                    <span className="text-2xl font-bold gradient-text">{customAmount[0]}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mínimo de 10 FitCoins • R$ 0,90 por FitCoin
                </p>
              </div>

              <Slider
                value={customAmount}
                onValueChange={setCustomAmount}
                min={10}
                max={500}
                step={1}
                className="w-full"
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="text-2xl font-bold text-teal-400">
                    R$ {(customAmount[0] * 0.9).toFixed(2)}
                  </span>
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-700 hover:to-teal-700 text-white font-semibold">
                  Comprar {customAmount[0]} FitCoins
                </Button>
              </div>
            </Card>
          </motion.div>
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
