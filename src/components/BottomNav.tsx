import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Clock, ChartBar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: UtensilsCrossed, label: 'Dieta', path: '/dashboard' },
  { icon: Clock, label: 'Jejum', path: '/fasting' },
  { icon: ChartBar, label: 'Progresso', path: '/progress' },
  { icon: User, label: 'Perfil', path: '/profile' },
] as const;

export const BottomNav = memo(function BottomNav() {
  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
      
      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
        {/* Gradient fade */}
        <div className="h-3 bg-gradient-to-b from-transparent via-background/70 to-background pointer-events-none" />
        
        {/* Nav bar */}
        <nav className="bg-background px-4 pb-3.5 pt-1">
          <div className="mx-auto max-w-lg rounded-3xl shadow-lg bg-card/90 border border-border/50 backdrop-blur-xl dark:border-lime-500/10 dark:shadow-[0_-8px_30px_-10px_rgba(132,204,22,0.15)]">
            <div className="flex items-center justify-around py-2">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors min-w-[64px]',
                      isActive ? 'text-lime-500' : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn('h-6 w-6', isActive && 'dark:drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]')}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className={cn('text-xs font-medium', isActive ? 'opacity-100' : 'opacity-70')}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
});
