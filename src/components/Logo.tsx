import { cn } from '@/lib/utils';

export interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  forceDark?: boolean;
}

const sizeClasses = {
  xs: 'text-base',
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function Logo({ className, size = 'md', forceDark = false }: LogoProps) {
  return (
    <span
      className={cn(
        sizeClasses[size],
        'font-extrabold tracking-tight select-none',
        forceDark ? 'text-white' : 'text-foreground',
        className
      )}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      Fast<span className="text-primary">Burn</span>
    </span>
  );
}
