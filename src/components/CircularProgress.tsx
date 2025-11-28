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
  strokeWidth = 20,
  children,
  className 
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  // Extra padding for glow effects
  const glowPadding = 30;
  const totalSize = size + glowPadding * 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={totalSize}
        height={totalSize}
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        className="transform -rotate-90"
        style={{ overflow: 'visible' }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(263 70% 58%)" />
            <stop offset="100%" stopColor="hsl(168 76% 48%)" />
          </linearGradient>
          
          {/* Stronger glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Outer glow for the ring */}
          <filter id="outerGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Background circle - thicker and more visible */}
        <circle
          cx={totalSize / 2}
          cy={totalSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        
        {/* Progress circle with gradient and glow */}
        <motion.circle
          cx={totalSize / 2}
          cy={totalSize / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ 
            filter: 'drop-shadow(0 0 12px hsl(263 70% 58% / 0.5)) drop-shadow(0 0 24px hsl(168 76% 48% / 0.3))'
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Progress head glow - enhanced */}
        {progress > 0 && (
          <motion.circle
            cx={totalSize / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI)}
            cy={totalSize / 2 - radius * Math.cos((progress / 100) * 2 * Math.PI)}
            r={strokeWidth / 2 + 6}
            fill="hsl(168 76% 48%)"
            className="opacity-60"
            style={{ 
              filter: 'drop-shadow(0 0 8px hsl(168 76% 48% / 0.8))'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
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
