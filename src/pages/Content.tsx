import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { BookOpen } from 'lucide-react';

export default function Content() {
  return (
    <div className="min-h-[100dvh] bg-background relative">
      {/* Premium gradient header */}
      <div className="absolute inset-x-0 -top-[100px] h-[580px]">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(132,204,22,0.15),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto max-w-lg relative">
        <div className="relative z-10">
          <AppHeader className="pt-[5px] py-0" />

          <div className="flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400/20 to-green-500/20 flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-lime-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Conteúdo</h1>
            <p className="text-muted-foreground max-w-xs">
              Em breve você terá acesso a artigos, dicas e guias sobre jejum intermitente.
            </p>
            <div className="mt-8 px-6 py-3 rounded-full bg-lime-500/10 border border-lime-500/20">
              <span className="text-sm font-semibold text-lime-600 dark:text-lime-400">🚀 Em breve</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
