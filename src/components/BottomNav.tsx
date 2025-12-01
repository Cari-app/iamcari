import { NavLink } from 'react-router-dom';
import { Home, BookOpen, User, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: BookOpen, label: 'Diário', path: '/diary' },
  { icon: Users, label: 'Comunidade', path: '/community' },
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
        <div className="rounded-3xl shadow-lg backdrop-blur-2xl bg-white/80 dark:bg-black/50 border border-white/30 dark:border-white/10">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 press-effect',
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
