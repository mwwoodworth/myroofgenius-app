'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type CardVariant = 'default' | 'glass' | 'interactive' | 'elevated'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  children: React.ReactNode
  className?: string
}

const cardVariants = {
  default: 'bg-gray-900 border border-gray-800',
  glass: 'glass',
  interactive: 'bg-gray-900 border border-gray-800 hover:border-gray-700 cursor-pointer',
  elevated: 'bg-gray-900 border border-gray-800 shadow-2xl',
}

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
}

const interactiveMotion = {
  whileHover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, children, className, ...props }, ref) => {
    const isInteractive = variant === 'interactive' || hover

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-xl p-6 transition-all duration-200',
          cardVariants[variant],
          className
        )}
        initial={cardMotion.initial}
        animate={cardMotion.animate}
        transition={cardMotion.transition}
        whileHover={isInteractive ? interactiveMotion.whileHover : undefined}
        whileTap={isInteractive ? interactiveMotion.whileTap : undefined}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'