import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase';
import { Moon, Sun, Mail, ArrowRight, Sparkles, Lock, Phone, User, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Email inválido');
const phoneSchema = z.string().regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');
export default function Login() {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    user
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Sanitize phone number to only digits
  const sanitizePhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Format phone number with mask (33) 99999-9999
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Format WhatsApp number for backend (add country code 55 if not present)
  const formatWhatsAppNumber = (input: string): string => {
    // Strip all non-numeric characters
    const digitsOnly = input.replace(/\D/g, '');

    // Check if it starts with 55 (Brazil country code)
    if (digitsOnly.startsWith('55')) {
      return digitsOnly;
    }

    // Prepend 55 if not present
    return '55' + digitsOnly;
  };

  // Validate sign up form
  const validateSignUpForm = (): boolean => {
    // Check if all fields are filled
    if (!fullName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive"
      });
      return false;
    }

    // Validate nickname
    if (!nickname.trim()) {
      toast({
        title: "Apelido obrigatório",
        description: "Por favor, escolha um apelido (nick).",
        variant: "destructive"
      });
      return false;
    }

    // Validate nickname format (no spaces, alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nickname.trim())) {
      toast({
        title: "Apelido inválido",
        description: "Use apenas letras, números e underscore. Entre 3-20 caracteres.",
        variant: "destructive"
      });
      return false;
    }

    // Validate phone
    const cleanPhone = sanitizePhone(whatsapp);
    const phoneValidation = phoneSchema.safeParse(cleanPhone);
    if (!phoneValidation.success) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido (10 ou 11 dígitos).",
        variant: "destructive"
      });
      return false;
    }

    // Validate email
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive"
      });
      return false;
    }

    // Validate password
    const passwordValidation = passwordSchema.safeParse(password);
    if (!passwordValidation.success) {
      toast({
        title: "Senha inválida",
        description: passwordValidation.error.errors[0].message,
        variant: "destructive"
      });
      return false;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive"
      });
      return false;
    }

    // Check terms acceptance
    if (!acceptedTerms) {
      toast({
        title: "Aceite os termos",
        description: "Você precisa aceitar os termos de uso e política de privacidade.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    setIsLoading(false);
    if (error) {
      console.error('Magic link error:', error);
      toast({
        title: "Erro ao enviar link",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setIsSent(true);
      toast({
        title: "Link mágico enviado! ✨",
        description: "Verifique seu email para acessar o FastBurn."
      });
    }
  };
  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Validate sign up form with all security checks
    if (isSignUp) {
      if (!validateSignUpForm()) {
        return;
      }
    }
    setIsLoading(true);
    if (isSignUp) {
      // Step 1: Create auth user
      const {
        data: authData,
        error: signUpError
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        toast({
          title: "Erro ao criar conta",
          description: signUpError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Immediately update profile with full_name, nickname, and whatsapp_number
      if (authData?.user) {
        const formattedPhone = formatWhatsAppNumber(whatsapp);
        const {
          error: profileError
        } = await supabase.from('profiles').update({
          full_name: fullName,
          nickname: nickname.trim(),
          whatsapp_number: formattedPhone
        }).eq('id', authData.user.id);
        if (profileError) {
          console.error('Profile update error:', profileError);
          toast({
            title: "Erro ao salvar dados",
            description: "Conta criada, mas houve erro ao salvar seus dados. Tente atualizar no perfil.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Conta criada! Bem-vindo ao Cari. 🎉",
            description: "Redirecionando para o onboarding..."
          });
        }
      }
    } else {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Erro ao entrar",
          description: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Bem-vindo de volta! 🎉",
          description: "Redirecionando..."
        });
      }
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen flex flex-col bg-background">
      {/* Theme Toggle */}
      <motion.div initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="absolute right-4" style={{
      top: 'calc(1rem + env(safe-area-inset-top, 0px))'
    }}>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl glass press-effect">
          {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary" />}
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }} className="mb-8">
          <Logo size="lg" />
        </motion.div>

        {/* Tagline */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="text-center mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-2">Emagrecimento Inteligente</h1>
          <p className="text-muted-foreground">IA + Planejamento Inteligente para sua jornada de saúde</p>
        </motion.div>

        {/* Login Form */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="w-full max-w-sm">
          <Tabs defaultValue="magic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-card/50 border border-border/50">
              <TabsTrigger value="magic" className="data-[state=active]:bg-primary/20">
                Magic Link
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-primary/20">
                Senha
              </TabsTrigger>
            </TabsList>

            <TabsContent value="magic">
              {!isSent ? <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                  </div>

                  <Button type="submit" disabled={isLoading || !email} className="w-full h-14 rounded-2xl gradient-primary text-white font-semibold text-base press-effect shadow-violet disabled:opacity-50">
                    {isLoading ? <motion.div animate={{
                  rotate: 360
                }} transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }}>
                        <Sparkles className="h-5 w-5" />
                      </motion.div> : <>
                        Entrar com Magic Link
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>}
                  </Button>
                </form> : <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="text-center p-6 rounded-3xl bg-card border border-border">
                  <motion.div animate={{
                scale: [1, 1.1, 1]
              }} transition={{
                duration: 2,
                repeat: Infinity
              }} className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                    <Mail className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Verifique seu email
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enviamos um link mágico para <strong>{email}</strong>
                  </p>
                </motion.div>}
            </TabsContent>

            <TabsContent value="password">
              <form onSubmit={handlePassword} className="space-y-4">
                <div className="space-y-4">
                  {isSignUp && <>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                      </div>

                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="text" placeholder="Apelido (Nick)" value={nickname} onChange={e => setNickname(e.target.value.toLowerCase())} className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" maxLength={20} required />
                        <p className="text-xs text-muted-foreground mt-1 ml-1">
                          Usado em posts e comunidade
                        </p>
                      </div>

                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="tel" placeholder="(33) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(formatPhoneNumber(e.target.value))} className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" maxLength={15} required />
                      </div>
                    </>}

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-12 pl-12 pr-4 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="h-12 pl-12 pr-12 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {isSignUp && <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12 pl-12 pr-12 rounded-2xl text-base bg-card border-border focus:border-primary" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>}
                </div>

                {isSignUp && <div className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50">
                    <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={checked => setAcceptedTerms(checked as boolean)} className="mt-0.5" />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      Ao criar uma conta, você aceita nossos{' '}
                      <button type="button" onClick={() => window.open('/terms', '_blank')} className="text-primary hover:underline font-medium">
                        Termos de Uso
                      </button>
                      {' '}e{' '}
                      <button type="button" onClick={() => window.open('/privacy', '_blank')} className="text-primary hover:underline font-medium">
                        Política de Privacidade
                      </button>
                      , incluindo o uso de seus dados para análise de IA.
                    </label>
                  </div>}

                <Button type="submit" disabled={isLoading || !email || !password} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base press-effect disabled:opacity-50">
                  {isLoading ? <motion.div animate={{
                  rotate: 360
                }} transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear'
                }}>
                      <Sparkles className="h-5 w-5" />
                    </motion.div> : <>{isSignUp ? 'Criar Conta' : 'Entrar'}</>}
                </Button>

                {/* Signup removed - users are created via Kirvano purchase */}
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Features */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.4
      }} className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Timer Inteligente
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Análise IA
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Suporte Personalizado
          </span>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.5
    }} className="py-6 text-center text-sm text-muted-foreground space-y-2">
        <p>Feito com 💜 para sua saúde</p>
        <p className="text-xs">
          Ao continuar, você concorda com nossos{' '}
          <button onClick={() => navigate('/terms')} className="text-primary hover:underline">
            Termos
          </button>
          {' '}e{' '}
          <button onClick={() => navigate('/privacy')} className="text-primary hover:underline">
            Privacidade
          </button>
        </p>
      </motion.footer>
    </div>;
}