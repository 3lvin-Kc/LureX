import React from 'react';
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassPanel = ({ 
  children, 
  className, 
  intensity = 'medium',
  ...props 
}: GlassPanelProps) => {
  const intensityClasses = {
    light: 'bg-white/20 dark:bg-black/10 backdrop-blur-sm',
    medium: 'bg-white/40 dark:bg-black/20 backdrop-blur-md',
    heavy: 'bg-white/60 dark:bg-black/40 backdrop-blur-lg'
  };

  return (
    <div 
      className={cn(
        intensityClasses[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
