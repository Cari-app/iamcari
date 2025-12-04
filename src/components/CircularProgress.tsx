import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({ 
  progress, 
  size = 280, 
  strokeWidth = 16,
  children,
  className 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      {/* Background blur circle */}
      <div 
        className="absolute rounded-full bg-muted/30 dark:bg-primary/5 backdrop-blur-sm"
        style={{ 
          width: size - 20, 
          height: size - 20,
        }}
      />
      
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Modern gradient - adapts to theme */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(142, 76%, 36%)" className="dark:stop-color-[hsl(84,85%,40%)]" />
            <stop offset="50%" stopColor="hsl(142, 70%, 45%)" className="dark:stop-color-[hsl(84,85%,45%)]" />
            <stop offset="100%" stopColor="hsl(84, 85%, 50%)" />
          </linearGradient>
          
          {/* Glow effect - enhanced for dark mode */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/50 dark:text-primary/10"
        />
        
        {/* Progress arc with gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          className="dark:drop-shadow-[0_0_15px_rgba(132,204,22,0.5)]"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Glowing dot at progress end */}
        {progress > 0 && (
          <motion.circle
            cx={size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI)}
            cy={size / 2 - radius * Math.cos((progress / 100) * 2 * Math.PI)}
            r={strokeWidth / 2 + 4}
            fill="hsl(84, 85%, 50%)"
            className="dark:drop-shadow-[0_0_20px_rgba(132,204,22,0.8)]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        )}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
