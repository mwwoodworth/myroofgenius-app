'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Button from './ui/Button'

export default function CopilotPanel() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40"
        aria-label="Open AI Copilot"
      >
        AI Copilot
      </Button>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed inset-y-0 right-0 w-80 bg-background/80 backdrop-blur shadow-lg p-6 z-50 border-l"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Claude Copilot</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2">✕</button>
            </div>
            <p className="text-sm text-foreground/70">Coming soon: context-aware assistance for your roofing business.</p>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
