import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Clock, ChartBar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: UtensilsCrossed, label: 'Dieta', path: '/dashboard' },
  { icon: Clock, label: 'Jejum', path: '/fasting' },
  { icon: ChartBar, label: 'Progresso', path: '/progress' },
  { icon: User, label: 'Perfil', path: '/profile' },
] as const;

export const BottomNav = memo(function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      <div className="h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="px-4 pb-4 bg-white"
      >
        <div className="mx-auto max-w-lg">
          <div className="rounded-3xl shadow-lg backdrop-blur-2xl bg-white/90 dark:bg-card/90 border border-border/50">
            <div className="flex items-center justify-around py-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 press-effect min-w-[64px]',
                      isActive ? 'text-[#84cc16]' : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                      <span className={cn('text-xs font-medium', isActive ? 'opacity-100' : 'opacity-70')}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
});
