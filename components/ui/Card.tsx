'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
}

export default function Card({ hover = true, className, ...props }: CardProps) {
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
      className={clsx('rounded-lg bg-bg-card p-6 min-h-[44px]', className)}
      {...props}
    />
  );
}
