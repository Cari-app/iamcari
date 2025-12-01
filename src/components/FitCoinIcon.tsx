import fitCoinImage from "@/assets/FitCoin.png";
import { cn } from "@/lib/utils";

interface FitCoinIconProps {
  className?: string;
  size?: number;
}

export function FitCoinIcon({ className, size = 16 }: FitCoinIconProps) {
  return (
    <img 
      src={fitCoinImage} 
      alt="FitCoin" 
      className={cn("inline-block", className)}
      style={{ width: size, height: size }}
    />
  );
}
