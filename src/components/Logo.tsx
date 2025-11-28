import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-20',
};

const textSizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function Logo({ className, size = 'md' }: LogoProps) {
  const { theme } = useTheme();
  
  return (
    <div className={cn('flex items-center gap-2', sizeClasses[size], className)}>
      {/* Logo Icon */}
      <svg 
        viewBox="0 0 48 48" 
        className={cn('h-full w-auto')}
        fill="none"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(263, 70%, 58%)" />
            <stop offset="100%" stopColor="hsl(168, 76%, 48%)" />
          </linearGradient>
          <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(263, 70%, 65%)" />
            <stop offset="100%" stopColor="hsl(168, 76%, 55%)" />
          </linearGradient>
        </defs>
        
        {/* Abstract leaf/flame shape representing fasting/energy */}
        <path 
          d="M24 4C24 4 10 18 10 28C10 35.732 16.268 42 24 42C31.732 42 38 35.732 38 28C38 18 24 4 24 4Z"
          fill={theme === 'dark' ? 'url(#logoGradientDark)' : 'url(#logoGradient)'}
        />
        
        {/* Inner detail - lightness/calm */}
        <path 
          d="M24 14C24 14 18 22 18 28C18 31.314 20.686 34 24 34C27.314 34 30 31.314 30 28C30 22 24 14 24 14Z"
          fill={theme === 'dark' ? 'hsl(222, 47%, 4%)' : 'white'}
          opacity="0.9"
        />
        
        {/* Small glow dot */}
        <circle 
          cx="24" 
          cy="26" 
          r="3" 
          fill={theme === 'dark' ? 'url(#logoGradientDark)' : 'url(#logoGradient)'}
        />
      </svg>
      
      {/* Text Logo */}
      <span className={cn(
        'font-bold tracking-tight',
        textSizes[size],
        theme === 'dark' ? 'text-foreground' : 'text-foreground'
      )}>
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Leve
        </span>
        <span className="text-foreground">Stay</span>
      </span>
    </div>
  );
}
