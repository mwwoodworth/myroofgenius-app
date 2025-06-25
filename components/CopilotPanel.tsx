'use client'
import { motion } from 'framer-motion'

export default function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-[rgba(44,44,46,0.8)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] shadow-2xl z-40 p-8"
    >
      <button className="absolute top-4 right-4 text-accent font-bold" onClick={onClose}>✕</button>
      <h3 className="text-2xl font-bold mb-4">AI Copilot</h3>
      <input className="w-full rounded-lg px-3 py-2 mb-2 bg-bg-card text-text-primary" placeholder="Ask AI about your project..." />
      <p className="text-text-secondary">Coming soon: Automated estimates, damage analysis, smart reports.</p>
    </motion.aside>
  )
}
