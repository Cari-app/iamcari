import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Gem, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFitCoinsConsumed: 0,
    totalFitCoinsDistributed: 0,
    activeSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchStats = async () => {
    try {
      // Total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total FitCoins consumed (negative transactions)
      const { data: consumedData } = await supabase
        .from('token_transactions')
        .select('amount')
        .lt('amount', 0);

      const totalConsumed = consumedData?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      // Total FitCoins distributed (positive transactions)
      const { data: distributedData } = await supabase
        .from('token_transactions')
        .select('amount')
        .gt('amount', 0);

      const totalDistributed = distributedData?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Active fasting sessions
      const { count: activeSessions } = await supabase
        .from('fasting_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: usersCount || 0,
        totalFitCoinsConsumed: totalConsumed,
        totalFitCoinsDistributed: totalDistributed,
        activeSessions: activeSessions || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-40 w-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-20 px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 mb-6"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">Painel Admin</h1>
          </div>
          <p className="text-muted-foreground">
            Visão geral do sistema LeveStay
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Users */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5 text-violet-400" />
                    Total de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground mt-1">Cadastrados na plataforma</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* FitCoins Consumed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-rose-400" />
                    FitCoins Consumidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{stats.totalFitCoinsConsumed}</p>
                  <p className="text-sm text-muted-foreground mt-1">Análises de IA realizadas</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* FitCoins Distributed */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-teal-500/10 to-green-500/10 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Gem className="h-5 w-5 text-teal-400" />
                    FitCoins Distribuídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{stats.totalFitCoinsDistributed}</p>
                  <p className="text-sm text-muted-foreground mt-1">Via planos e recargas</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5 text-amber-400" />
                    Jejuns Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-foreground">{stats.activeSessions}</p>
                  <p className="text-sm text-muted-foreground mt-1">Usuários em jejum agora</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
