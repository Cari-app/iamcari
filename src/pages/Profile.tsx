import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Camera,
  Loader2,
  Clock,
  LogOut,
  Moon,
  Sun,
  Scale,
  Bell,
  HelpCircle,
  Shield,
  ChevronRight,
  Sparkles,
  Utensils,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import logoImage from '@/assets/logo-cari.png';

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, profile } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

  // Notifications preference
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notifications_enabled');
    return saved !== 'false';
  });

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notifications_enabled', String(checked));
  };

  // Fetch essential profile data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEssentialData = async () => {
      const [profileResult, fastingResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, nickname, avatar_url, weight, height, active_diet')
          .eq('id', user.id)
          .single(),
        supabase
          .from('fasting_sessions')
          .select('start_time, end_time')
          .eq('user_id', user.id)
          .not('end_time', 'is', null)
      ]);

      const profileData = profileResult.data;
      if (profileData) {
        setFullName(profileData.full_name || user.email?.split('@')[0] || 'Usuário');
        setNickname(profileData.nickname || '');
        setAvatarUrl(profileData.avatar_url);
        setBodyWeight(profileData.weight || 0);
        setBodyHeight(profileData.height || 0);
        
        if (profileData.active_diet) {
          supabase
            .from('diet_types')
            .select('id, name, icon, short_description, color_theme')
            .eq('id', profileData.active_diet)
            .single()
            .then(({ data: dietData }) => {
              if (dietData) setActiveDiet(dietData);
            });
        }
      }

      const fastingData = fastingResult.data;
      if (fastingData) {
        const totalHours = fastingData.reduce((acc, session) => {
          const start = new Date(session.start_time);
          const end = new Date(session.end_time!);
          return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);
        setTotalFastingHours(Math.floor(totalHours));
      }

      setLoading(false);
    };

    fetchEssentialData();
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
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          weight: bodyWeight,
          height: bodyHeight,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

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

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#84cc16]" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pb-20 bg-background relative">
      {/* Green Gradient Background */}
      <div className="absolute inset-x-0 -top-[100px] h-[420px] bg-gradient-to-b from-green-950 via-green-900 to-transparent" />
      <div className="mx-auto max-w-lg relative">
        
        <div className="relative z-10">
          {/* Top Bar */}
          <header className="flex items-center justify-center px-4 pb-2 pt-safe-top mt-6">
            <img src={logoImage} alt="Cari" className="h-6" />
          </header>

          {/* Profile Header */}
          <div className="text-center px-4 mt-4">
            <h2 className="text-2xl text-white font-semibold">Meu Perfil</h2>
            <p className="text-white/60 text-sm mt-1">Gerencie suas informações</p>
          </div>

          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pt-6"
          >
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-start gap-4">
                {/* Avatar */}
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
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#84cc16]/50"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center border-2 border-[#84cc16]/50">
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
                </div>

                {/* Name & Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-foreground truncate">
                        {fullName}
                      </h1>
                      {isAdmin && (
                        <Badge className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs border-none">
                          <Shield className="h-3 w-3 mr-1" />
                          ADMIN
                        </Badge>
                      )}
                    </div>
                    {nickname && (
                      <p className="text-sm text-muted-foreground">
                        @{nickname}
                      </p>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-[#84cc16]" />
                    <span>{totalFastingHours}h de jejum total</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="px-4 pt-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/nutrition-quiz')}
                className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2 press-effect hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#84cc16]" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">Mapeamento</span>
              </button>
              
              <button
                onClick={() => navigate('/diets')}
                className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2 press-effect hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-[#84cc16]" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">Dietas</span>
              </button>
              
              <button
                onClick={() => navigate('/fasting-quiz')}
                className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-2 press-effect hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-[#84cc16]" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">Quiz Jejum</span>
              </button>
            </div>
          </motion.div>

          {/* Active Diet Card */}
          {activeDiet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="px-4 pt-4"
            >
              <div className="p-4 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 bg-[#84cc16]/10 border-[#84cc16]/50">
                    {activeDiet.icon}
                  </div>

                  {/* Diet Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold mb-1 text-[#84cc16]">
                      {activeDiet.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeDiet.short_description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Menu */}
          <main className="px-4 pt-4 space-y-4">
            {/* Group 1: Biometria */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Biometria
              </p>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
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
              </div>
            </motion.div>

            {/* Group 2: App Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Configurações
              </p>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="w-full flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Notificações</span>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={handleNotificationsToggle}
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-[#84cc16]" />
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
              </div>
            </motion.div>

            {/* Group 3: Suporte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Suporte
              </p>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
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
              </div>
            </motion.div>

            {/* Footer: Logout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4 rounded-2xl border-destructive/30 hover:bg-destructive/10 text-destructive"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sair da Conta</span>
              </Button>
            </motion.div>
          </main>
        </div>
      </div>

      <BottomNav />

      {/* Body Stats Drawer */}
      <Drawer open={isBodyStatsOpen} onOpenChange={setIsBodyStatsOpen}>
        <DrawerContent className="bg-transparent border-none">
          <div className="mx-auto w-full max-w-lg bg-card border border-border rounded-t-3xl">
            <DrawerHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-[#84cc16]" />
                </div>
                <div>
                  <DrawerTitle className="text-foreground">Atualizar Dados Corporais</DrawerTitle>
                  <DrawerDescription>Mantenha seus dados atualizados para cálculos mais precisos</DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={bodyWeight || ''}
                  onChange={(e) => setBodyWeight(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 70"
                  className="bg-muted/50 border-border rounded-xl"
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
                  className="bg-muted/50 border-border rounded-xl"
                />
              </div>
            </div>

            <DrawerFooter className="pt-2">
              <Button
                onClick={handleSaveBodyStats}
                disabled={savingBodyStats}
                className="w-full bg-[#84cc16] hover:bg-[#84cc16]/90 text-white"
              >
                {savingBodyStats ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Personal Data Drawer */}
      <Drawer open={isPersonalDataOpen} onOpenChange={setIsPersonalDataOpen}>
        <DrawerContent className="bg-transparent border-none">
          <div className="mx-auto w-full max-w-lg bg-card border border-border rounded-t-3xl">
            <DrawerHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#84cc16]/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#84cc16]" />
                </div>
                <div>
                  <DrawerTitle className="text-foreground">Editar Meus Dados</DrawerTitle>
                  <DrawerDescription>Atualize suas informações pessoais</DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-muted/50 border-border rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido (opcional)</Label>
                <Input
                  id="nickname"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="Ex: joaosilva"
                  className="bg-muted/50 border-border rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Use apenas letras, números e underscore. Entre 3-20 caracteres.
                </p>
              </div>
            </div>

            <DrawerFooter className="pt-2">
              <Button
                onClick={handleSavePersonalData}
                disabled={savingPersonalData}
                className="w-full bg-[#84cc16] hover:bg-[#84cc16]/90 text-white"
              >
                {savingPersonalData ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full">
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
