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
  Scale,
  Crown,
  Bell,
  HelpCircle,
  Shield,
  ChevronRight,
  Gem,
  Zap,
  Swords,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [nickname, setNickname] = useState<string>('');
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
  
  // Active Diet
  const [activeDiet, setActiveDiet] = useState<{
    id: string;
    name: string;
    icon: string;
    short_description: string;
    color_theme: string;
  } | null>(null);

  // Body Stats Dialog
  const [isBodyStatsOpen, setIsBodyStatsOpen] = useState(false);
  const [bodyWeight, setBodyWeight] = useState<number>(0);
  const [bodyHeight, setBodyHeight] = useState<number>(0);
  const [savingBodyStats, setSavingBodyStats] = useState(false);

  // Personal Data Dialog
  const [isPersonalDataOpen, setIsPersonalDataOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [savingPersonalData, setSavingPersonalData] = useState(false);

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
        .select('full_name, nickname, avatar_url, weight, height, active_diet')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setFullName(profileData.full_name || user.email?.split('@')[0] || 'Jogador');
        setNickname(profileData.nickname || '');
        setAvatarUrl(profileData.avatar_url);
        setBodyWeight(profileData.weight || 0);
        setBodyHeight(profileData.height || 0);
        
        // Fetch active diet details if exists
        if (profileData.active_diet) {
          const { data: dietData } = await supabase
            .from('diet_types')
            .select('id, name, icon, short_description, color_theme')
            .eq('id', profileData.active_diet)
            .single();
          
          if (dietData) {
            setActiveDiet(dietData);
          }
        }
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

  const handleEditBodyStats = () => {
    setIsBodyStatsOpen(true);
  };

  const handleEditPersonalData = () => {
    setEditFullName(fullName);
    setEditNickname(nickname);
    setIsPersonalDataOpen(true);
  };

  const handleSavePersonalData = async () => {
    if (!user) return;

    // Validate nickname format
    if (editNickname.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(editNickname.trim())) {
      toast({
        title: '❌ Apelido inválido',
        description: 'Use apenas letras, números e underscore. Entre 3-20 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setSavingPersonalData(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: editFullName.trim(),
          nickname: editNickname.trim() || null,
        })
        .eq('id', user.id);

      if (error) {
        // Check if it's a unique constraint error
        if (error.code === '23505') {
          toast({
            title: '❌ Apelido já existe',
            description: 'Esse apelido já está sendo usado. Escolha outro.',
            variant: 'destructive',
          });
          return;
        }
        throw error;
      }

      setFullName(editFullName.trim());
      setNickname(editNickname.trim());
      setIsPersonalDataOpen(false);

      toast({
        title: '✅ Dados atualizados',
        description: 'Suas informações foram salvas',
      });
    } catch (error) {
      console.error('Error updating personal data:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível atualizar seus dados',
        variant: 'destructive',
      });
    } finally {
      setSavingPersonalData(false);
    }
  };

  const handleSaveBodyStats = async () => {
    if (!user) return;

    setSavingBodyStats(true);

    try {
      // Update profile basic info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          weight: bodyWeight,
          height: bodyHeight,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Create new assessment to recalculate BMR/TDEE via DB trigger
      const { data: latestAssessment } = await supabase
        .from('assessments')
        .select('gender, age, activity_level, goal_type, goal_speed, target_weight_kg')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          gender: latestAssessment?.gender || 'male',
          age: latestAssessment?.age || 30,
          height_cm: bodyHeight,
          weight_kg: bodyWeight,
          activity_level: latestAssessment?.activity_level || 'moderate',
          goal_type: latestAssessment?.goal_type || 'maintain',
          goal_speed: latestAssessment?.goal_speed || null,
          target_weight_kg: latestAssessment?.target_weight_kg || null,
        });

      if (assessmentError) throw assessmentError;

      setIsBodyStatsOpen(false);

      toast({
        title: '✅ Dados atualizados',
        description: 'Nova avaliação metabólica calculada',
      });
    } catch (error) {
      console.error('Error updating body stats:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível atualizar seus dados',
        variant: 'destructive',
      });
    } finally {
      setSavingBodyStats(false);
    }
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

  // Get recent/next achievements (prioritize unlocked, then locked)
  const recentAchievements = [
    ...achievements.filter(a => isAchievementUnlocked(a.code)),
    ...achievements.filter(a => !isAchievementUnlocked(a.code)),
  ].slice(0, 4);

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Section A: The Player Card (Compact - Max 35% height) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-primary/30 overflow-hidden">
              <CardContent className="p-5 space-y-4">
                {/* Top Row: Avatar + Info */}
                <div className="flex items-start gap-4">
                  {/* Avatar with Level Badge */}
                  <div className="relative flex-shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    
                    <div className="relative w-20 h-20 group">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/50"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center border-2 border-primary/50">
                          <User className="h-10 w-10 text-white" />
                        </div>
                      )}
                      
                      <button
                        onClick={handleAvatarClick}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Level Badge (Corner) */}
                    <div className="absolute -bottom-1 -right-1">
                      <Badge className="px-2 py-0.5 gradient-primary text-white font-bold text-xs">
                        Lvl {currentLevel}
                      </Badge>
                    </div>
                  </div>

                  {/* Name, Title & XP */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h1 className="text-xl font-bold text-foreground truncate">
                        {fullName}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {getPlayerTitle()}
                      </p>
                    </div>
                    
                    {/* XP Progress */}
                    <div className="space-y-1">
                      <Progress value={xpProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {currentXP} / 1000 XP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Flame className="h-5 w-5 text-rose" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Dias</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats?.game_coins || 0}</p>
                    <p className="text-xs text-muted-foreground">Game Coins</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-5 w-5 text-teal" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{totalFastingHours}</p>
                    <p className="text-xs text-muted-foreground">Horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Diet Card */}
          {activeDiet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="glass border-teal-500/30 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Sua Dieta Ativa
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/diet-result')}
                      className="h-7 text-xs"
                    >
                      Ver detalhes
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Diet Icon */}
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl",
                      "border-2",
                      activeDiet.color_theme === 'violet' && "bg-violet-500/10 border-violet-500/50",
                      activeDiet.color_theme === 'teal' && "bg-teal-500/10 border-teal-500/50",
                      activeDiet.color_theme === 'blue' && "bg-blue-500/10 border-blue-500/50",
                      activeDiet.color_theme === 'red' && "bg-red-500/10 border-red-500/50",
                      activeDiet.color_theme === 'orange' && "bg-orange-500/10 border-orange-500/50",
                      activeDiet.color_theme === 'green' && "bg-green-500/10 border-green-500/50",
                    )}>
                      {activeDiet.icon}
                    </div>

                    {/* Diet Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-lg font-bold mb-1",
                        activeDiet.color_theme === 'violet' && "text-violet-400",
                        activeDiet.color_theme === 'teal' && "text-teal-400",
                        activeDiet.color_theme === 'blue' && "text-blue-400",
                        activeDiet.color_theme === 'red' && "text-red-400",
                        activeDiet.color_theme === 'orange' && "text-orange-400",
                        activeDiet.color_theme === 'green' && "text-green-400",
                      )}>
                        {activeDiet.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {activeDiet.short_description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Section B: Recent Achievements (Horizontal Carousel) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Conquistas Recentes
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {recentAchievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.code);
                
                return (
                  <button
                    key={achievement.id}
                    onClick={() => handleAchievementClick(achievement)}
                    className={cn(
                      "relative h-28 p-2 rounded-xl border transition-all",
                      "flex flex-col items-center justify-center gap-1",
                      unlocked
                        ? "bg-gradient-to-br from-teal-500/20 to-violet-500/20 border-primary/50 shadow-lg shadow-primary/10 hover:shadow-primary/20"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    )}
                  >
                    {/* Lock icon overlay for locked achievements */}
                    {!unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "text-2xl transition-all",
                      !unlocked && "grayscale opacity-50"
                    )}>
                      {achievement.icon || '🏆'}
                    </div>

                    {/* Name */}
                    <p className={cn(
                      "text-[10px] font-medium text-center line-clamp-2 leading-tight w-full",
                      unlocked ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {achievement.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Section C: The Control Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Group 1: Biometria */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Biometria
              </p>
              <Card>
                <CardContent className="p-0">
                  <button
                    onClick={handleEditPersonalData}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Meus Dados</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={handleEditBodyStats}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Dados Corporais</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Group 2: App Settings */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Configurações
              </p>
              <Card>
                <CardContent className="p-0">
                  <button
                    onClick={() => navigate('/plans')}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Planos & FitCoins</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>

                  {/* TODO: Arena feature coming soon - Remove this button or create Arena page */}
                  <button
                    onClick={() => toast({
                      title: '🚧 Em breve',
                      description: 'A Arena está em desenvolvimento. Aguarde novidades!',
                    })}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Swords className="h-5 w-5 text-violet-500" />
                      <span className="font-medium text-foreground">Arena</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Em breve</Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <button
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Notificações</span>
                    </div>
                    <Switch defaultChecked />
                  </button>

                  <div className="flex items-center justify-between p-4">
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
            </div>

            {/* Group 3: Suporte */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Suporte
              </p>
              <Card>
                <CardContent className="p-0">
                  <button
                    onClick={() => navigate('/help')}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Ajuda & Suporte</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => navigate('/privacy')}
                    className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">Termos & Privacidade</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Footer: Logout */}
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

      {/* Body Stats Dialog */}
      <Dialog open={isBodyStatsOpen} onOpenChange={setIsBodyStatsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Dados Corporais</DialogTitle>
            <DialogDescription>
              Mantenha seus dados atualizados para cálculos mais precisos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={bodyWeight || ''}
                onChange={(e) => setBodyWeight(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={bodyHeight || ''}
                onChange={(e) => setBodyHeight(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 170"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBodyStatsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveBodyStats}
              disabled={savingBodyStats || !bodyWeight || !bodyHeight}
              className="gradient-primary text-white"
            >
              {savingBodyStats && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Personal Data Dialog */}
      <Dialog open={isPersonalDataOpen} onOpenChange={setIsPersonalDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Meus Dados</DialogTitle>
            <DialogDescription>
              Edite seu nome e apelido (nick) usado na comunidade
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fullname">Nome Completo</Label>
              <Input
                id="edit-fullname"
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nickname">Apelido (Nick)</Label>
              <Input
                id="edit-nickname"
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value.toLowerCase())}
                placeholder="seu_nick"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Usado em posts e comunidade. Use apenas letras, números e underscore (3-20 caracteres).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPersonalDataOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePersonalData}
              disabled={savingPersonalData || !editFullName.trim()}
              className="gradient-primary text-white"
            >
              {savingPersonalData && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
