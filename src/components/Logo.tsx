import { useTheme } from '@/contexts/ThemeContext';
import logoCariGreen from '@/assets/logo-cari-green.png';
import logoCariWhite from '@/assets/logo-cari-white.png';
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
  
  // Use green logo for light mode, white logo for dark mode
  // forceDark forces the white logo for use on colored backgrounds
  const logo = forceDark || theme === 'dark' ? logoCariWhite : logoCariGreen;
  
  return (
    <img 
      src={logo} 
      alt="Cari" 
      className={cn(sizeClasses[size], 'w-auto object-contain', className)}
    />
  );
}
