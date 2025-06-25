'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const send = async () => {
    if (!input) return
    setLoading(true)
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      if (res.ok) {
        const data = await res.json()
        setReply(data.reply)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-[rgba(44,44,46,0.8)] backdrop-blur-xl border-l border-[rgba(255,255,255,0.1)] shadow-2xl z-40 p-8"
    >
      <button className="absolute top-4 right-4 text-accent font-bold" onClick={onClose}>✕</button>
      <h3 className="text-2xl font-bold mb-4">AI Copilot</h3>
      <textarea
        className="w-full rounded-lg px-3 py-2 mb-2 bg-bg-card text-text-primary"
        placeholder="Ask AI about your project..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={send}
        className="bg-accent text-white px-4 py-2 rounded-md disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Thinking...' : 'Send'}
      </button>
      {reply && <p className="mt-4 text-text-secondary">{reply}</p>}
    </motion.aside>
  )
}
