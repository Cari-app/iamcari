import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { User, Camera, Loader2, Clock, LogOut, Moon, Sun, Bell, HelpCircle, Shield, ChevronRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { AppHeader } from '@/components/AppHeader';

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
        supabase.from('profiles').select('full_name, nickname, avatar_url').eq('id', user.id).single(),
        supabase.from('fasting_sessions').select('start_time, end_time').eq('user_id', user.id).not('end_time', 'is', null)
      ]);
      const profileData = profileResult.data;
      if (profileData) {
        setFullName(profileData.full_name || user.email?.split('@')[0] || 'Usuário');
        setNickname(profileData.nickname || '');
        setAvatarUrl(profileData.avatar_url);
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

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: '❌ Arquivo inválido', description: 'Por favor, selecione uma imagem', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: '❌ Arquivo muito grande', description: 'O tamanho máximo é 2MB', variant: 'destructive' });
      return;
    }
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      await refreshProfile();
      toast({ title: '✅ Avatar atualizado', description: 'Sua foto foi salva com sucesso' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: '❌ Erro ao fazer upload', description: 'Não foi possível salvar sua foto', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleEditPersonalData = () => {
    setEditFullName(fullName);
    setEditNickname(nickname);
    setIsPersonalDataOpen(true);
  };

  const handleSavePersonalData = async () => {
    if (!user) return;
    if (editNickname.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(editNickname.trim())) {
      toast({ title: '❌ Apelido inválido', description: 'Use apenas letras, números e underscore. Entre 3-20 caracteres.', variant: 'destructive' });
      return;
    }
    setSavingPersonalData(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: editFullName.trim(),
        nickname: editNickname.trim() || null
      }).eq('id', user.id);
      if (error) {
        if (error.code === '23505') {
          toast({ title: '❌ Apelido já existe', description: 'Esse apelido já está sendo usado. Escolha outro.', variant: 'destructive' });
          return;
        }
        throw error;
      }
      setFullName(editFullName.trim());
      setNickname(editNickname.trim());
      setIsPersonalDataOpen(false);
      toast({ title: '✅ Dados atualizados', description: 'Suas informações foram salvas' });
    } catch (error) {
      console.error('Error updating personal data:', error);
      toast({ title: '❌ Erro ao salvar', description: 'Não foi possível atualizar seus dados', variant: 'destructive' });
    } finally {
      setSavingPersonalData(false);
    }
  };

  if (loading) {
    return <div className="min-h-[100dvh] bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#84cc16]" />
    </div>;
  }

  return <div className="min-h-[100dvh] bg-background relative">
    {/* Premium gradient header with depth */}
    <div className="absolute inset-x-0 -top-[100px] h-[580px]">
      <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
    <div className="mx-auto max-w-lg relative">
      <div className="relative z-10">
        <AppHeader showAvatar={false} centered />

        {/* Profile Header */}
        <div className="text-center px-4 mt-4">
          <h2 className="text-2xl text-white font-semibold">Meu Perfil</h2>
          <p className="text-white/60 text-sm mt-1">Gerencie suas informações</p>
        </div>

        {/* Avatar Card */}
        <div className="px-4 pt-6">
          <div className="relative p-5 rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-1 rounded-b-full bg-gradient-to-r from-green-500 via-lime-400 to-green-500" />
            <div className="flex items-start gap-4 mt-2">
              <div className="relative flex-shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <div className="relative w-20 h-20 group">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-lime-500/30 shadow-lg shadow-lime-500/20" /> : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center ring-2 ring-lime-500/30 shadow-lg shadow-lime-500/20">
                    <User className="h-10 w-10 text-white" />
                  </div>}
                  <button onClick={handleAvatarClick} disabled={uploadingAvatar} className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    {uploadingAvatar ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Camera className="h-6 w-6 text-white" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground truncate">{fullName}</h1>
                    {isAdmin && <Badge className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs border-none shadow-md shadow-amber-500/30">
                      <Shield className="h-3 w-3 mr-1" />ADMIN
                    </Badge>}
                  </div>
                  {nickname && <p className="text-sm text-muted-foreground">@{nickname}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-lime-500" />
                  <span>{totalFastingHours}h de jejum total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action - Quiz Jejum */}
        <div className="px-4 pt-4">
          <button onClick={() => navigate('/fasting-quiz')} className="relative w-full p-4 rounded-2xl bg-white dark:bg-card flex items-center gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] hover:shadow-[0_8px_30px_-4px_rgba(132,204,22,0.2)] press-effect transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full bg-gradient-to-r from-green-500 via-lime-400 to-green-500" />
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
              <Timer className="h-5 w-5 text-lime-500" />
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold text-foreground">Quiz de Jejum</span>
              <p className="text-xs text-muted-foreground">Descubra seu protocolo ideal</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
          </button>
        </div>

        {/* Settings Menu */}
        <main className="px-4 pt-4 space-y-4 pb-[20px] mb-[13px]">
          {/* Group 1: Conta */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Conta</p>
            <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
              <button onClick={handleEditPersonalData} className="w-full flex items-center justify-between p-4 press-effect hover:bg-lime-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-lime-500" />
                  </div>
                  <span className="font-medium text-foreground">Meus Dados</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Group 2: App Settings */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Configurações</p>
            <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
              <div className="w-full flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-lime-500" />
                  </div>
                  <span className="font-medium text-foreground">Notificações</span>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="h-5 w-5 text-lime-500" /> : <Sun className="h-5 w-5 text-lime-500" />}
                  </div>
                  <span className="font-medium text-foreground">Modo Escuro</span>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </div>
          </div>

          {/* Group 3: Suporte */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Suporte</p>
            <div className="rounded-2xl bg-white dark:bg-card shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(132,204,22,0.15)] overflow-hidden">
              <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between p-4 press-effect hover:bg-lime-500/5 transition-colors border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-lime-500" />
                  </div>
                  <span className="font-medium text-foreground">Ajuda & Suporte</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button onClick={() => navigate('/privacy')} className="w-full flex items-center justify-between p-4 press-effect hover:bg-lime-500/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-lime-500" />
                  </div>
                  <span className="font-medium text-foreground">Termos & Privacidade</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Footer: Logout */}
          <div>
            <Button onClick={handleSignOut} variant="outline" className="w-full justify-start gap-3 h-auto py-4 rounded-2xl border-destructive/30 hover:bg-destructive/10 text-destructive shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair da Conta</span>
            </Button>
          </div>
        </main>
      </div>
    </div>

    <BottomNav />

    {/* Personal Data Drawer */}
    <Drawer open={isPersonalDataOpen} onOpenChange={setIsPersonalDataOpen}>
      <DrawerContent className="bg-transparent border-none">
        <div className="mx-auto w-full max-w-lg bg-card border border-lime-500/20 rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(132,204,22,0.2)]">
          <DrawerHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-lime-500" />
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
              <Input id="fullName" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Seu nome" className="bg-muted/50 border-lime-500/20 rounded-xl focus:border-lime-500/50 focus:ring-lime-500/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido (opcional)</Label>
              <Input id="nickname" value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="Ex: joaosilva" className="bg-muted/50 border-lime-500/20 rounded-xl focus:border-lime-500/50 focus:ring-lime-500/20" />
              <p className="text-xs text-muted-foreground">Use apenas letras, números e underscore. Entre 3-20 caracteres.</p>
            </div>
          </div>
          <DrawerFooter className="pt-2">
            <Button onClick={handleSavePersonalData} disabled={savingPersonalData} className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-600 hover:to-green-600 text-white shadow-lg shadow-lime-500/30">
              {savingPersonalData ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="w-full">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  </div>;
}
