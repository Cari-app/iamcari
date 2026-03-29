import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase';
import { Moon, Sun, Mail, Lock, Phone, User, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');
const phoneSchema = z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos');

type Step = 'verify' | 'register' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<Step>('verify');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<{ customer_name: string; product_name: string } | null>(null);

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatWhatsAppNumber = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.startsWith('55') ? digitsOnly : '55' + digitsOnly;
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({ title: "Email inválido", description: "Digite um email válido.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Check if email has an approved purchase
    const { data: purchase, error } = await (supabase as any)
      .from('purchases')
      .select('email, customer_name, product_name, status, user_id')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'authorized')
      .is('user_id', null)
      .maybeSingle();

    setIsLoading(false);

    if (error) {
      console.error('Error checking purchase:', error);
      toast({ title: "Erro", description: "Erro ao verificar compra. Tente novamente.", variant: "destructive" });
      return;
    }

    if (!purchase) {
      toast({
        title: "Compra não encontrada",
        description: "Este email não possui uma compra aprovada ou já possui uma conta cadastrada.",
        variant: "destructive"
      });
      return;
    }

    setPurchaseData({ customer_name: purchase.customer_name || '', product_name: purchase.product_name || '' });
    if (purchase.customer_name) setFullName(purchase.customer_name);
    setStep('register');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    if (!nickname.trim() || !/^[a-zA-Z0-9_]{3,20}$/.test(nickname.trim())) {
      toast({ title: "Apelido inválido", description: "Use letras, números e underscore. 3-20 caracteres.", variant: "destructive" });
      return;
    }
    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (!phoneSchema.safeParse(cleanPhone).success) {
      toast({ title: "Telefone inválido", variant: "destructive" });
      return;
    }
    if (!passwordSchema.safeParse(password).success) {
      toast({ title: "Senha inválida", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Senhas não conferem", variant: "destructive" });
      return;
    }
    if (!acceptedTerms) {
      toast({ title: "Aceite os termos", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    // Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/fasting` }
    });

    if (signUpError) {
      toast({ title: "Erro ao criar conta", description: signUpError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (authData?.user) {
      // Update profile
      const formattedPhone = formatWhatsAppNumber(whatsapp);
      await supabase.from('profiles').update({
        full_name: fullName,
        nickname: nickname.trim(),
        whatsapp_number: formattedPhone,
      }).eq('id', authData.user.id);

      // Link purchase to user (this will fail silently due to RLS - only service_role can update purchases)
      // The edge function or admin will handle this linkage
      // For now we proceed - the user is created and can use the app

      setStep('success');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-4"
        style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl glass press-effect">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary" />}
        </Button>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="mb-6">
          <Logo size="lg" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-sm">

          {/* Step: Verify Email */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Ative sua conta</h1>
                <p className="text-muted-foreground text-sm">Digite o email usado na compra para criar seu acesso</p>
              </div>

              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email usado na compra"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-14 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary"
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading || !email} className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-violet disabled:opacity-50">
                  {isLoading ? 'Verificando...' : 'Verificar compra'}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{' '}
                <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
                  Fazer login
                </button>
              </p>
            </div>
          )}

          {/* Step: Register */}
          {step === 'register' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Compra verificada!</h1>
                {purchaseData?.product_name && (
                  <p className="text-sm text-muted-foreground">Produto: <strong className="text-foreground">{purchaseData.product_name}</strong></p>
                )}
                <p className="text-muted-foreground text-sm mt-1">Crie sua conta para começar</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)}
                    className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                </div>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="text" placeholder="Apelido (Nick)" value={nickname} onChange={e => setNickname(e.target.value.toLowerCase())}
                    className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" maxLength={20} required />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type="tel" placeholder="(33) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(formatPhoneNumber(e.target.value))}
                    className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" maxLength={15} required />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Criar senha" value={password} onChange={e => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirmar senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50">
                  <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={checked => setAcceptedTerms(checked as boolean)} className="mt-0.5" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Aceito os{' '}
                    <button type="button" onClick={() => window.open('/terms', '_blank')} className="text-primary hover:underline font-medium">Termos</button>
                    {' '}e{' '}
                    <button type="button" onClick={() => window.open('/privacy', '_blank')} className="text-primary hover:underline font-medium">Privacidade</button>
                  </label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-violet disabled:opacity-50">
                  {isLoading ? 'Criando conta...' : 'Criar minha conta'}
                </Button>
              </form>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Conta criada! 🎉</h1>
                <p className="text-muted-foreground">Sua conta foi criada com sucesso. Baixe o aplicativo para começar!</p>
              </div>

              <Button onClick={() => navigate('/install')} className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-violet">
                Baixar o Aplicativo
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
