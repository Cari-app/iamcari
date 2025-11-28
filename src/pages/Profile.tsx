import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Gem,
  Crown,
  Camera,
  Pencil,
  Loader2,
  FileText,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Bell, label: 'Notificações', action: 'toggle' },
  { icon: Shield, label: 'Privacidade', action: 'navigate' },
  { icon: HelpCircle, label: 'Ajuda & Suporte', action: 'navigate' },
];

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name, avatar_url, whatsapp_number, token_balance, tier')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: '❌ Erro ao carregar perfil',
          description: 'Não foi possível carregar seus dados',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (data) {
        setFullName(data.full_name || user.email?.split('@')[0] || 'Usuário');
        setAvatarUrl(data.avatar_url);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Arquivo inválido',
        description: 'Por favor, selecione uma imagem',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
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
      // Upload to avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profiles table with new avatar URL
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

  const handleEditName = () => {
    setEditNameValue(fullName);
    setIsEditNameOpen(true);
  };

  const handleSaveName = async () => {
    if (!user || !editNameValue.trim()) return;

    setSavingName(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editNameValue.trim() })
        .eq('id', user.id);

      if (error) throw error;

      setFullName(editNameValue.trim());
      setIsEditNameOpen(false);

      toast({
        title: '✅ Nome atualizado',
        description: 'Suas informações foram salvas',
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: 'Não foi possível atualizar seu nome',
        variant: 'destructive',
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAccount = async () => {
    // TODO: Implement account deletion logic
    toast({
      title: '⚠️ Função em desenvolvimento',
      description: 'A exclusão de conta estará disponível em breve.',
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <Navbar />
      
      <main className="px-4 py-6">
        <div className="mx-auto max-w-lg space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center pt-4"
          >
            <div className="relative w-20 h-20 mx-auto mb-4 group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
              
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {fullName || 'Defina seu nome'}
              </h1>
              <button
                onClick={handleEditName}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors press-effect"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <p className="text-muted-foreground">{user?.email || 'usuario@email.com'}</p>
          </motion.div>

          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl border border-primary/30 bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Gem className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {profile?.tier === 'free' ? 'Plano Gratuito' : profile?.tier === 'premium' ? 'Plano Premium' : 'Plano Pro'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.token_balance || 0} tokens restantes
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="rounded-xl gradient-primary text-white press-effect"
              >
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            </div>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-card border border-border"
          >
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
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-border overflow-hidden"
          >
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                className={cn(
                  "w-full flex items-center justify-between p-4 press-effect",
                  "hover:bg-muted/50 transition-colors",
                  index !== menuItems.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                {item.action === 'navigate' && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                {item.action === 'toggle' && (
                  <Switch defaultChecked />
                )}
              </button>
            ))}
          </motion.div>

          {/* Sobre Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="space-y-2"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              Sobre
            </p>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <button
                onClick={() => navigate('/terms')}
                className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Termos de Uso</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => navigate('/privacy')}
                className="w-full flex items-center justify-between p-4 press-effect hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">Política de Privacidade</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-4 press-effect hover:bg-destructive/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash className="h-5 w-5 text-rose-500" />
                  <span className="font-medium text-rose-500">Deletar minha conta</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Button
              variant="ghost"
              className="w-full h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10 press-effect"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair da conta
            </Button>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted-foreground"
          >
            LeveStay v1.0.0
          </motion.p>
        </div>
      </main>

      {/* Edit Name Dialog */}
      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar Nome</DialogTitle>
            <DialogDescription>
              Digite seu nome completo
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="name" className="text-foreground">
              Nome
            </Label>
            <Input
              id="name"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              placeholder="Seu nome completo"
              className="mt-2 bg-background"
              maxLength={100}
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditNameOpen(false)}
              disabled={savingName}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveName}
              disabled={!editNameValue.trim() || savingName}
              className="gradient-primary text-white"
            >
              {savingName ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-500 flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Deletar Conta Permanentemente
            </DialogTitle>
            <DialogDescription className="text-foreground font-semibold">
              ⚠️ Esta ação é IRREVERSÍVEL
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-foreground font-medium mb-2">
                Ao deletar sua conta:
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Sua assinatura será <strong className="text-foreground">cancelada imediatamente</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Todos os dados serão <strong className="text-foreground">excluídos permanentemente</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Histórico de jejum, refeições e progresso serão perdidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">•</span>
                  <span>Tokens e configurações não poderão ser recuperados</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Para voltar a usar o app</strong>, você precisará criar uma nova conta e fazer uma <strong className="text-foreground">nova assinatura</strong>.
              </p>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Não há como desfazer esta ação. Tenha certeza absoluta antes de continuar.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAccount}
              className="flex-1 bg-rose-500 hover:bg-rose-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Sim, Deletar Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
