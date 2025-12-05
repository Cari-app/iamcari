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
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20" />

      {/* Fixed navigation container */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe-bottom">
        {/* Navigation card */}
        <div className="relative mx-auto max-w-lg mb-4">
          <div className="rounded-[1.75rem] bg-white dark:bg-card shadow-lg dark:shadow-xl border border-border/5">
            <div className="flex items-center justify-around py-2.5 px-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 min-w-[64px]',
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
                      
                      {/* Icon */}
                      <item.icon
                        className={cn('relative h-6 w-6', isActive && 'text-lime-500')}
                        strokeWidth={isActive ? 2.5 : 1.75}
                      />
                      
                      {/* Label */}
                      <span
                        className={cn(
                          'relative text-[11px] font-semibold tracking-tight',
                          isActive
                            ? 'text-lime-600 dark:text-lime-400'
                            : 'opacity-60'
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});
