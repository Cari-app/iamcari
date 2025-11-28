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
  strokeWidth = 12,
  children,
  className 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Progress circle with gradient */}
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
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Progress head glow */}
        {progress > 0 && (
          <motion.circle
            cx={size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI)}
            cy={size / 2 - radius * Math.cos((progress / 100) * 2 * Math.PI)}
            r={strokeWidth / 2 + 4}
            fill="hsl(var(--secondary))"
            className="opacity-50"
            filter="url(#glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
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
