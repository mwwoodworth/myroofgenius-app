'use client'
import { useState } from 'react'
import CopilotPanel from '../CopilotPanel'

export default function CopilotWrapper() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="fixed bottom-6 right-6 rounded-xl px-5 py-2 bg-accent text-white font-bold shadow-md hover:scale-105 transition"
        onClick={() => setOpen(true)}
      >
        AI Copilot
      </button>
      <CopilotPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
