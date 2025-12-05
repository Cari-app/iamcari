import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Clock, ChartBar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [{
  icon: UtensilsCrossed,
  label: 'Dieta',
  path: '/dashboard'
}, {
  icon: Clock,
  label: 'Jejum',
  path: '/fasting'
}, {
  icon: ChartBar,
  label: 'Progresso',
  path: '/progress'
}, {
  icon: User,
  label: 'Perfil',
  path: '/profile'
}] as const;

export const BottomNav = memo(function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background gradient: transparent to white (top to bottom) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-background/70 dark:to-background pointer-events-none" />
      
      <nav className="relative px-4 pb-safe-bottom pt-3 mb-3.5">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl shadow-xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-border/30 dark:border-primary/10 dark:shadow-[0_4px_20px_-5px_rgba(132,204,22,0.2)]">
            <div className="flex items-center justify-around py-2">
              {NAV_ITEMS.map(item => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => cn(
                    'flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all duration-200 press-effect min-w-[60px]',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={cn(
                          "h-5 w-5 transition-transform",
                          isActive && "scale-110 dark:drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]"
                        )} 
                        strokeWidth={isActive ? 2.5 : 2} 
                      />
                      <span className={cn(
                        'text-[11px] font-medium',
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
        </div>
      </nav>
    </div>
  );
});
