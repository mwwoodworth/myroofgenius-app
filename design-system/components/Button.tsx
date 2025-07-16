'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHapticFeedback } from './hooks/useHapticFeedback'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  hapticFeedback?: boolean
  children: React.ReactNode
  className?: string
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700',
  ghost: 'text-text-primary hover:bg-white/10',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  glass: 'glass glass-button text-white',
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm tap-target-sm',
  md: 'px-4 py-2 text-base tap-target',
  lg: 'px-6 py-3 text-lg tap-target-lg',
}

const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    hapticFeedback = true,
    children, 
    className, 
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const { trigger } = useHapticFeedback()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticFeedback && !disabled) {
        trigger(variant === 'destructive' ? 'warning' : 'light')
      }
      onClick?.(e)
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={buttonMotion.whileHover}
        whileTap={buttonMotion.whileTap}
        transition={buttonMotion.transition}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        <motion.span
          className={cn('flex items-center gap-2', loading && 'opacity-0')}
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </motion.button>
    )
  }
)

Button.displayName = 'Button'