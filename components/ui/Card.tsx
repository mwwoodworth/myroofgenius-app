'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  glass?: boolean
}

export default function Card({ hover = true, glass = false, className, ...props }: CardProps) {
  const motionProps = hover
    ? {
        whileHover: {
          y: -4,
          rotateX: 5,
          rotateY: -5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: { type: 'spring' as const, stiffness: 200, damping: 15 },
        },
        style: { perspective: 1000 },
      }
    : {};
  return (
    <motion.div
      {...motionProps}
      className={clsx('rounded-lg p-6 min-h-[44px]', glass ? 'glass-card' : 'bg-bg-card', className)}
      {...props}
    />
  );
}
