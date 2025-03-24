
import React, { useState, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Create a more specific props interface that extends the motion component props
interface Button3DProps extends Omit<HTMLMotionProps<"button">, "className" | "children" | "onClick"> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const Button3D: React.FC<Button3DProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Define the base styles
  const baseStyles = "font-medium relative rounded-full transition-all duration-200 overflow-hidden transform";
  
  // Variant styles
  const variantStyles = {
    default: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg",
    outline: "border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300 bg-transparent hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
  };
  
  // Size styles
  const sizeStyles = {
    sm: "px-4 py-1 text-sm",
    md: "px-6 py-2",
    lg: "px-8 py-3 text-lg"
  };

  // Effect styles for 3D look
  const getDepthEffect = () => {
    if (variant === 'default') {
      return isPressed 
        ? "translate-y-[1px] shadow-sm" 
        : isHovered 
          ? "translate-y-[-2px] shadow-xl shadow-blue-500/30" 
          : "translate-y-0 shadow-md shadow-blue-500/20";
    }
    return isPressed 
      ? "translate-y-[1px]" 
      : isHovered 
        ? "translate-y-[-2px]" 
        : "translate-y-0";
  };

  // Event handlers
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <motion.button
      ref={buttonRef}
      className={`
        ${baseStyles} 
        ${variantStyles[variant]} 
        ${sizeStyles[size]} 
        ${getDepthEffect()}
        ${className}
      `}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Animated gradient background */}
      {variant === 'default' && (
        <div
          className={`
            absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500
            bg-size-200 transition-all duration-500
            ${isHovered ? 'bg-pos-100' : 'bg-pos-0'}
          `}
        />
      )}
      
      {/* Glow effect */}
      {isHovered && variant === 'default' && (
        <div className="absolute inset-0 -z-10 blur-md opacity-50 bg-blue-500 rounded-full scale-110" />
      )}
    </motion.button>
  );
};

export default Button3D;
