import { useTheme } from '@/contexts/ThemeContext';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  forceDark?: boolean;
}

// The logo is horizontally wide (aspect ratio ~4:1), so we use width-based sizing
const sizeClasses = {
  xs: 'h-5',
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-14',
};

export function Logo({ className, size = 'md', forceDark = false }: LogoProps) {
  const { theme } = useTheme();
  
  // Use logo-light for light mode (black text), logo-dark for dark mode (white text)
  // forceDark forces the dark logo (white text) for use on colored backgrounds
  const logo = forceDark || theme === 'dark' ? logoDark : logoLight;
  
  return (
    <img 
      src={logo} 
      alt="Cari" 
      className={cn(sizeClasses[size], 'w-auto object-contain', className)}
    />
  );
}
