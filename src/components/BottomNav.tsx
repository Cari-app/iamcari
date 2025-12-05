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
      {/* Spacer */}
      <div className="h-24" />
      
      {/* Fixed navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
        <div className="h-8 bg-gradient-to-b from-transparent via-background/80 to-background pointer-events-none" />
        <nav className="bg-background px-4 pb-4">
          <div className="mx-auto max-w-lg rounded-[1.75rem] bg-white dark:bg-card shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.12),0_0_0_1px_rgba(132,204,22,0.1)] dark:shadow-[0_-8px_40px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(132,204,22,0.15),0_0_30px_-10px_rgba(132,204,22,0.1)]">
            <div className="flex items-center justify-around py-3">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]',
                      isActive 
                        ? 'text-lime-600 dark:text-lime-400' 
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active background pill */}
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-br from-lime-400/15 to-green-500/15 dark:from-lime-500/20 dark:to-green-500/25 rounded-2xl" />
                      )}
                      <item.icon
                        className={cn(
                          'relative h-6 w-6',
                          isActive && 'text-lime-500'
                        )}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      <span className={cn(
                        'relative text-[11px] font-semibold tracking-tight',
                        isActive ? 'text-lime-600 dark:text-lime-400' : 'opacity-60'
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
