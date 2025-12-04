import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo-cari.png';

interface Diet {
  id: string;
  name: string;
  icon: string;
  short_description: string;
  full_description: string;
  color_theme: string;
}

export default function ExploreDiets() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diets, setDiets] = useState<Diet[]>([]);
  const [activeDiet, setActiveDiet] = useState<Diet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiets();
    if (profile?.active_diet) {
      fetchActiveDiet();
    }
  }, [profile]);

  const fetchDiets = async () => {
    try {
      const { data, error } = await supabase
        .from('diet_types')
        .select('id, name, icon, short_description, full_description, color_theme')
        .order('name');

      if (error) throw error;
      if (data) setDiets(data);
    } catch (error) {
      console.error('Error fetching diets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveDiet = async () => {
    if (!profile?.active_diet) return;
    
    try {
      const { data, error } = await supabase
        .from('diet_types')
        .select('id, name, icon, short_description, full_description, color_theme')
        .eq('id', profile.active_diet)
        .maybeSingle();

      if (error) throw error;
      if (data) setActiveDiet(data);
    } catch (error) {
      console.error('Error fetching active diet:', error);
    }
  };

  const handleDietClick = (dietId: string) => {
    navigate(`/diet-detail?diet=${dietId}`);
  };

  return (
    <div className="min-h-[100dvh] pb-32 bg-background">
      <div className="mx-auto max-w-lg relative">
        {/* Green Gradient Background */}
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-4 pt-4 pb-2 pt-safe-top">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <img src={logoImage} alt="Cari" className="h-8" />
            </div>
            <Link to="/profile">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </header>

          {/* Status Text */}
          <div className="px-4 mt-4">
            <h2 className="text-2xl text-white font-semibold">Explorar Dietas</h2>
            <p className="text-white/60 text-sm mt-1">
              Descubra qual dieta se encaixa perfeitamente no seu estilo de vida
            </p>
          </div>

          <main className="px-4 pt-6 space-y-4">
            {/* Active Diet Banner */}
            {activeDiet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {activeDiet.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-[#84cc16]" />
                      <p className="text-xs font-medium text-muted-foreground">
                        Sua dieta ativa
                      </p>
                    </div>
                    <h3 className="text-lg font-bold text-[#84cc16]">
                      {activeDiet.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Diets Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Skeleton className="h-32 rounded-2xl" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {diets.map((diet, index) => (
                  <motion.button
                    key={diet.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleDietClick(diet.id)}
                    className="p-5 rounded-2xl bg-card border border-border hover:bg-accent/50 transition-all duration-200 press-effect text-center group"
                  >
                    <div className="flex justify-center mb-3">
                      <div className="text-4xl transition-transform duration-200 group-hover:scale-110">
                        {diet.icon}
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold mb-2 leading-tight text-[#84cc16]">
                      {diet.name}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {diet.short_description}
                    </p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                💡 <span className="font-medium">Dica:</span> Clique em qualquer dieta para ver detalhes completos, 
                incluindo alimentos permitidos e exemplo de cardápio
              </p>
            </motion.div>
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
