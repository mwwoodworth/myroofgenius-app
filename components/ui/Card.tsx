'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export default function Card({ hover = true, className, ...props }: CardProps) {
  const motionProps = hover
    ? { whileHover: { y: -4, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' } }
    : {};
  return (
    <motion.div
      {...motionProps}
      className={clsx('rounded-lg bg-bg-card p-6 min-h-[44px]', className)}
      {...(props as any)}
    />
  );
}
