
import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  hoverEffect = true,
}) => {
  // Intensity settings
  const intensityStyles = {
    light: 'bg-white/10 backdrop-blur-sm border border-white/10 dark:bg-black/10 dark:border-white/5',
    medium: 'bg-white/20 backdrop-blur-md border border-white/20 dark:bg-black/20 dark:border-white/10',
    heavy: 'bg-white/30 backdrop-blur-lg border border-white/30 dark:bg-black/30 dark:border-white/15',
  };

  return (
    <motion.div
      className={`
        rounded-2xl shadow-xl ${intensityStyles[intensity]} 
        relative overflow-hidden ${className}
        ${hoverEffect ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl p-[1px] -z-10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x" />
      </div>

      {/* Content */}
      {children}

      {/* Light reflection */}
      <div className="absolute -top-1/2 -right-1/2 w-2/3 h-2/3 bg-gradient-to-br from-white/5 to-transparent rounded-full transform rotate-45 pointer-events-none" />
    </motion.div>
  );
};

export default GlassCard;
