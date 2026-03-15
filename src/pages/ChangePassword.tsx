import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Also handle recovery token from URL (email link flow)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      // User came from recovery email - session is already set by Supabase
      console.log('Recovery flow detected');
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A senha e a confirmação devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });

      if (passwordError) throw passwordError;

      // Clear the must_change_password flag
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ must_change_password: false })
          .eq('id', user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      }

      await refreshProfile();

      toast({
        title: '✅ Senha criada!',
        description: 'Sua senha foi definida com sucesso. Bem-vindo ao FastBurn!',
      });

      navigate('/fasting');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: '❌ Erro',
        description: error.message || 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-card rounded-2xl p-8 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Crie sua senha
              </h1>
              <p className="text-sm text-muted-foreground">
                Defina uma senha segura para sua conta
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <Label htmlFor="password" className="text-foreground">
                Nova Senha
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 pr-12 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pl-12 pr-12 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
            >
              {isLoading ? 'Salvando...' : 'Definir Senha e Entrar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
