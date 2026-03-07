import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share, Smartphone, CheckCircle2, Zap, Shield, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install error:', err);
    }
  };

  const features = [
    { icon: Zap, label: 'Timer de Jejum Inteligente', desc: 'Controle seus ciclos com precisão' },
    { icon: Brain, label: 'Análise com IA', desc: 'Insights personalizados pra você' },
    { icon: Shield, label: 'Funciona Offline', desc: 'Use mesmo sem internet' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-6"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Baixe o Cari
          </h1>
          <p className="text-muted-foreground text-lg">
            Instale o app no seu celular em segundos
          </p>
        </motion.div>

        {/* Phone mockup / illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-40 h-72 rounded-3xl border-4 border-border bg-card shadow-2xl flex flex-col items-center justify-center gap-3 mx-auto relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-8 bg-foreground/10 rounded-b-xl flex items-center justify-center">
              <div className="w-16 h-1.5 rounded-full bg-foreground/20" />
            </div>
            <Smartphone className="h-12 w-12 text-primary" />
            <span className="text-sm font-semibold text-foreground">Cari</span>
            <span className="text-xs text-muted-foreground">Seu app de saúde</span>
          </div>
        </motion.div>

        {/* Install Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4 mb-10"
        >
          {isStandalone || installed ? (
            <div className="bg-card rounded-2xl border border-primary/30 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-foreground mb-1">
                App Instalado! 🎉
              </h2>
              <p className="text-muted-foreground text-sm">
                O Cari já está na sua tela inicial. Abra o app e comece sua jornada!
              </p>
              <Button
                onClick={() => window.location.href = '/login'}
                className="mt-4 w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base"
              >
                Abrir o Cari
              </Button>
            </div>
          ) : isIOS ? (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                Instale no seu iPhone
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Toque em <Share className="inline h-4 w-4 text-primary" /> Compartilhar
                    </p>
                    <p className="text-xs text-muted-foreground">Na barra inferior do Safari</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Toque em <strong>"Adicionar à Tela de Início"</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">Role a lista até encontrar</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Toque em <strong>"Adicionar"</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">Pronto! O Cari aparecerá na sua tela</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="w-full h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40"
            >
              <Download className="mr-3 h-6 w-6" />
              Instalar o Cari
            </Button>
          )}

          {!isStandalone && !installed && !isIOS && !deferredPrompt && (
            <p className="text-xs text-muted-foreground text-center">
              Abra esta página no navegador do celular (Chrome) para instalar
            </p>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3"
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feat.label}</p>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-xs text-muted-foreground text-center"
        >
          Feito com 💜 para sua saúde
        </motion.p>
      </div>
    </div>
  );
}
