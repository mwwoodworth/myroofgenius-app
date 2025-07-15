'use client';
import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  hover?: boolean;
  glow?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, glow = false, children, onClick, style }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: 'spring' as const, stiffness: 300 }}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-white/5 backdrop-blur-xl',
          'border border-white/10',
          'shadow-xl',
          glow && 'shadow-primary/20',
          'transition-all duration-300',
          hover && 'hover:bg-white/[0.07] hover:border-white/20 hover:shadow-2xl',
          className
        )}
        onClick={onClick}
        style={style}
      >
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Optional glow effect */}
        {glow && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.1), transparent 40%)',
            }}
          />
        )}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;