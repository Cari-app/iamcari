import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, Clock, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: UtensilsCrossed, label: 'Dieta', path: '/dashboard' },
  { icon: Clock, label: 'Jejum', path: '/fasting' },
  { icon: BarChart3, label: 'Progresso', path: '/progress' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function BottomNav() {
  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-area-inset-bottom"
    >
      <div className="mx-auto max-w-lg">
        <div className="rounded-3xl shadow-lg backdrop-blur-2xl bg-white/90 dark:bg-card/90 border border-border/50">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 press-effect min-w-[64px]',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn(
                      'text-xs font-medium transition-all',
                      isActive ? 'opacity-100' : 'opacity-70'
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
    </motion.nav>
  );
}
