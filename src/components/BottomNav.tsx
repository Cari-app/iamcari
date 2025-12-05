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
      {/* Spacer - matches nav height */}
      <div className="h-20" />
      
      {/* Fixed navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
        {/* Fade gradient - taller and smoother */}
        <div className="h-6 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <nav className="bg-background/80 backdrop-blur-md px-4 pb-3.5">
          <div className="mx-auto max-w-lg rounded-[1.75rem] bg-card/95 backdrop-blur-xl border border-border/40 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.5)_inset] dark:border-lime-500/10 dark:shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(132,204,22,0.05)_inset,0_-4px_24px_-8px_rgba(132,204,22,0.1)]">
            <div className="flex items-center justify-around py-2.5">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]',
                      isActive 
                        ? 'text-lime-500' 
                        : 'text-muted-foreground hover:text-foreground active:scale-95'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute -top-0.5 w-1 h-1 rounded-full bg-lime-500 dark:shadow-[0_0_8px_2px_rgba(132,204,22,0.5)]" />
                      )}
                      <item.icon
                        className={cn(
                          'h-6 w-6 transition-transform duration-200',
                          isActive && 'dark:drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]'
                        )}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <span className={cn(
                        'text-[11px] font-medium tracking-tight transition-opacity duration-200',
                        isActive ? 'opacity-100' : 'opacity-60'
                      )}>
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
