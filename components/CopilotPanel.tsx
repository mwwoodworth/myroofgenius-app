'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Msg = {
  role: 'user' | 'assistant'
  content: string
}

export default function CopilotPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [recording, setRecording] = useState(false)
  // SpeechRecognition types are not universally available so we fall back to `any`
  const recognizer = useRef<any>(null)

  const userRole = 'field' // TODO: replace with real auth role

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('copilotSession')
      const sid = stored || crypto.randomUUID()
      setSessionId(sid)
      localStorage.setItem('copilotSession', sid)
    }
  }, [open])

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/copilot?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((d) => setMessages(d.history || []))
        .catch(() => {})
    }
  }, [sessionId])

  if (!open) return null

  const appendAssistant = (text: string) => {
    setMessages((m) => {
      const copy = [...m]
      const last = copy[copy.length - 1]
      if (last && last.role === 'assistant') {
        copy[copy.length - 1] = { role: 'assistant', content: text }
        return copy
      }
      return [...copy, { role: 'assistant', content: text }]
    })
  }

  const send = async (content?: string) => {
    const msg = content ?? input
    if (!msg) return
    setInput('')
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', content: msg }])
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, sessionId }),
      })

      const sid = res.headers.get('x-session-id')
      if (sid) {
        setSessionId(sid)
        localStorage.setItem('copilotSession', sid)
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      if (reader) {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          acc += decoder.decode(value)
          appendAssistant(acc)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const startVoice = () => {
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!Rec) return
    recognizer.current = new Rec()
    recognizer.current.lang = 'en-US'
    recognizer.current.interimResults = false
    recognizer.current.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setInput(t)
    }
    recognizer.current.onend = () => setRecording(false)
    recognizer.current.start()
    setRecording(true)
  }

  const quickActions: Record<string, string[]> = {
    field: ['Generate an estimate'],
    pm: ['Create a support ticket'],
    executive: ['Show best-selling template'],
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
      <div className="flex gap-2 mb-4">
        {quickActions[userRole].map((a) => (
          <button
            key={a}
            onClick={() => send(a)}
            className="px-3 py-1 rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"
          >
            {a}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto h-[60%] mb-4 pr-2">
        {messages.map((m, i) => (
          <p key={i} className={m.role === 'user' ? 'text-right text-blue-200' : 'text-green-200'}>
            {m.content}
          </p>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <textarea
          className="flex-1 rounded-lg px-3 py-2 bg-bg-card text-text-primary"
          placeholder="Ask AI about your project..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={startVoice}
          className="px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.1)]"
        >
          {recording ? '🎙️...' : '🎙️'}
        </button>
        <button
          onClick={() => send()}
          className="bg-accent text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </motion.aside>
  )
}
