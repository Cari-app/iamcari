import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Camera,
  Loader2,
  Flame,
  Trophy,
  Clock,
  Lock,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { FitCoinIcon } from '@/components/FitCoinIcon';

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_reward: number | null;
}

interface UserAchievement {
  achievement_code: string;
  unlocked_at: string;
}

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { stats, loading: statsLoading } = useGamification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Achievements data
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementDrawerOpen, setAchievementDrawerOpen] = useState(false);
  
  // Stats
  const [totalFastingHours, setTotalFastingHours] = useState(0);

  // Fetch profile data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || user.email?.split('@')[0] || 'Jogador');
        setAvatarUrl(profileData.avatar_url);
      }

      // Fetch total fasting hours
      const { data: fastingData } = await supabase
        .from('fasting_sessions')
        .select('start_time, end_time')
        .eq('user_id', user.id)
        .not('end_time', 'is', null);

      if (fastingData) {
        const totalHours = fastingData.reduce((acc, session) => {
          const start = new Date(session.start_time);
          const end = new Date(session.end_time!);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return acc + hours;
        }, 0);
        setTotalFastingHours(Math.floor(totalHours));
      }

      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('id', { ascending: true });

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // Fetch user's unlocked achievements
      const { data: userAchievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_code, unlocked_at')
        .eq('user_id', user.id);

      if (userAchievementsData) {
        setUserAchievements(userAchievementsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Arquivo inválido',
        description: 'Por favor, selecione uma imagem',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '❌ Arquivo muito grande',
        description: 'O tamanho máximo é 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);

      toast({
        title: '✅ Avatar atualizado',
        description: 'Sua foto foi salva com sucesso',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: '❌ Erro ao fazer upload',
        description: 'Não foi possível salvar sua foto',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAchievementUnlocked = (code: string) => {
    return userAchievements.some(ua => ua.achievement_code === code);
  };

  const getUnlockedDate = (code: string) => {
    const achievement = userAchievements.find(ua => ua.achievement_code === code);
    if (!achievement) return null;
    return new Date(achievement.unlocked_at).toLocaleDateString('pt-BR');
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setAchievementDrawerOpen(true);
  };

  const getPlayerTitle = () => {
    const level = stats?.current_level || 1;
    if (level >= 20) return 'Mestre do Jejum';
    if (level >= 15) return 'Guerreiro Épico';
    if (level >= 10) return 'Veterano';
    if (level >= 5) return 'Explorador';
    return 'Iniciante';
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentLevel = stats?.current_level || 1;
  const currentXP = stats?.current_cycle_xp || 0;
  const xpProgress = (currentXP / 1000) * 100;

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Hero Section - The Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            {/* Avatar with Level Badge */}
            <div className="relative inline-block">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <div className="relative w-32 h-32 mx-auto group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-violet"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center border-4 border-primary shadow-violet">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
                
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </button>
              </div>

              {/* Level Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge className="px-4 py-1.5 gradient-primary text-white font-bold text-lg shadow-violet border-2 border-background">
                  Nível {currentLevel}
                </Badge>
              </div>
            </div>

            {/* Name & Title */}
            <div className="space-y-1 mt-6">
              <h1 className="text-3xl font-bold text-foreground">
                {fullName}
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                {getPlayerTitle()}
              </p>
            </div>

            {/* XP Bar */}
            <div className="max-w-md mx-auto space-y-2 px-4">
              <Progress value={xpProgress} className="h-4 shadow-md" />
              <p className="text-sm font-medium text-muted-foreground">
                {currentXP} / 1000 XP para o próximo nível
              </p>
            </div>
          </motion.div>

          {/* Stats Grid - The HUD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            {/* Streak */}
            <Card className="glass border-primary/30">
              <CardContent className="p-4 text-center space-y-2">
                <Flame className="h-8 w-8 mx-auto text-rose" />
                <p className="text-2xl font-bold text-foreground">{stats?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Sequência (dias)</p>
              </CardContent>
            </Card>

            {/* Coins */}
            <Card className="glass border-primary/30">
              <CardContent className="p-4 text-center space-y-2">
                <FitCoinIcon size={32} className="mx-auto" />
                <p className="text-2xl font-bold text-foreground">{stats?.game_coins || 0}</p>
                <p className="text-xs text-muted-foreground font-medium">Moedas</p>
              </CardContent>
            </Card>

            {/* Total Fasting Hours */}
            <Card className="glass border-primary/30">
              <CardContent className="p-4 text-center space-y-2">
                <Clock className="h-8 w-8 mx-auto text-teal" />
                <p className="text-2xl font-bold text-foreground">{totalFastingHours}</p>
                <p className="text-xs text-muted-foreground font-medium">Horas de Jejum</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements Section - The Trophy Room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Suas Conquistas
              </h2>
              <Badge variant="secondary" className="text-xs">
                {userAchievements.length}/{achievements.length}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.code);
                
                return (
                  <motion.button
                    key={achievement.id}
                    onClick={() => handleAchievementClick(achievement)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 transition-all",
                      unlocked
                        ? "bg-card border-primary shadow-violet"
                        : "bg-card/50 border-border grayscale opacity-60"
                    )}
                  >
                    {/* Lock overlay for locked achievements */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Icon or Trophy */}
                    <div className={cn("text-4xl mb-2", !unlocked && "opacity-0")}>
                      {achievement.icon || '🏆'}
                    </div>

                    {/* Name */}
                    <p className={cn(
                      "text-xs font-semibold line-clamp-2",
                      unlocked ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {achievement.name}
                    </p>

                    {/* Unlocked badge */}
                    {unlocked && (
                      <Badge 
                        variant="outline" 
                        className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground border-primary"
                      >
                        ✓
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wider px-2">
              Configurações
            </h3>

            {/* Theme Toggle */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium text-foreground">Modo Escuro</span>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 border-destructive/30 hover:bg-destructive/10 text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair da Conta</span>
            </Button>
          </motion.div>
        </div>
      </main>

      <BottomNav />

      {/* Achievement Details Drawer */}
      <Drawer open={achievementDrawerOpen} onOpenChange={setAchievementDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-3 text-2xl">
              <span className="text-4xl">{selectedAchievement?.icon || '🏆'}</span>
              {selectedAchievement?.name}
            </DrawerTitle>
            <DrawerDescription className="mt-4 space-y-4">
              <div>
                <p className="text-base text-foreground">
                  {selectedAchievement?.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Badge className="gradient-primary text-white">
                  +{selectedAchievement?.xp_reward || 0} XP
                </Badge>
                
                {selectedAchievement && isAchievementUnlocked(selectedAchievement.code) && (
                  <Badge variant="secondary">
                    Desbloqueado em {getUnlockedDate(selectedAchievement.code)}
                  </Badge>
                )}
              </div>

              {selectedAchievement && !isAchievementUnlocked(selectedAchievement.code) && (
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Como desbloquear:</strong> {selectedAchievement.description}
                  </p>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                Fechar
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
