'use client'
import Button from '../ui/Button'
import { motion } from 'framer-motion'

export default function UpgradeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between"
    >
      <p className="font-semibold">Upgrade to Pro and get every tool at 25% off!</p>
      <Button as="a" href="/marketplace" variant="secondary" className="bg-white text-blue-600 hover:bg-white/80">
        View Bundles
      </Button>
    </motion.div>
  )
}
