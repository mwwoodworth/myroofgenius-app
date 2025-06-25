'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-8 opacity-75">The page you're looking for doesn't exist.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </motion.div>
    </div>
  )
}
