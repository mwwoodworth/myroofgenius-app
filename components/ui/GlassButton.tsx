'use client';
import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, onClick, type = 'button', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary/10 hover:bg-primary/20 text-primary border-primary/20',
      secondary: 'bg-white/5 hover:bg-white/10 text-white border-white/10',
      danger: 'bg-danger/10 hover:bg-danger/20 text-danger border-danger/20',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-xl font-medium',
          'backdrop-blur-xl border transition-all duration-200',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
          'before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;