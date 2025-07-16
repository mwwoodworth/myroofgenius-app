'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  animated?: boolean
}

export function Progress({ 
  value, 
  max = 100, 
  className, 
  showValue = false, 
  animated = true 
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn('relative w-full', className)}>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0, 
            ease: 'easeOut',
            delay: animated ? 0.2 : 0
          }}
        />
      </div>
      
      {showValue && (
        <motion.div
          className="absolute -top-8 right-0 text-sm font-medium text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.div>
      )}
    </div>
  )
}