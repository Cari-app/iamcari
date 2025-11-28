import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
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
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.email?.split('@')[0] || 'Usuário'}
            </h1>
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

      <BottomNav />
    </div>
  );
}
