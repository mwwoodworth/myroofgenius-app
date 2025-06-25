'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

const base = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition'
const variants = {
  primary: 'bg-accent text-background hover:bg-accent/90',
  secondary: 'border border-accent text-accent hover:bg-accent hover:text-background',
}
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...(props as any)}
    />
  )
}
