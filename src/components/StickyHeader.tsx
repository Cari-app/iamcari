import { memo, useState, useEffect, useRef } from 'react';
import { Bell, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export const StickyHeader = memo(function StickyHeader() {
  const [visible, setVisible] = useState(false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 60;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up and past threshold
      if (currentScrollY < lastScrollY.current && currentScrollY > scrollThreshold) {
        setVisible(true);
      } 
      // Hide header when scrolling down or at top
      else if (currentScrollY > lastScrollY.current || currentScrollY <= scrollThreshold) {
        setVisible(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[90] pt-safe-top"
        >
          <div className="mx-4 mt-2 rounded-2xl backdrop-blur-xl bg-background/80 border border-border/50 shadow-lg dark:bg-card/80 dark:border-primary/10 dark:shadow-[0_8px_30px_-10px_rgba(132,204,22,0.15)]">
            <div className="flex items-center justify-between px-4 py-3">
              <Logo className="h-7" />
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
});
