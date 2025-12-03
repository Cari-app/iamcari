import { Logo } from './Logo';
import { GamificationWidget } from './GamificationWidget';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Hide gamification widget on profile page
  const hideGamification = location.pathname === '/profile';

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 px-4"
      style={{ 
        paddingTop: isMobile 
          ? 'calc(1rem + env(safe-area-inset-top, 0px))' 
          : '1rem' 
      }}
    >
      <div className="mx-auto max-w-lg">
        <div className="glass rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
          <Logo size="xs" />
          
          <div className="flex items-center gap-2">
            {!hideGamification && <GamificationWidget />}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl press-effect"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-primary" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
