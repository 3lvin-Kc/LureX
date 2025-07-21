
import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

const AnimatedCard = ({ 
  children, 
  className, 
  glowColor = 'rgba(59, 130, 246, 0.5)',
  hoverEffect = true,
  ...props 
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovering) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovering]);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const glowStyle = isHovering ? {
    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${glowColor} 0%, rgba(255, 255, 255, 0) 70%)`,
    opacity: 0.6,
  } : {};

  return (
    <div 
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition-all duration-300',
        hoverEffect && 'hover:-translate-y-1 hover:shadow-lg',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {hoverEffect && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
          style={glowStyle}
        />
      )}
    </div>
  );
};

export default AnimatedCard;
