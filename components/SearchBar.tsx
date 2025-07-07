'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{id: string; name: string; description: string}[]>([])

  const search = async () => {
    if (!query) return
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query})
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="relative"
    >
      <motion.input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') search();
        }}
        placeholder="Search..."
        whileFocus={{ scale: 1.05 }}
        className="border px-3 py-2 rounded-xl glass-card w-full"
      />
      {results.length > 0 && (
        <ul className="absolute mt-1 w-full z-10 max-h-64 overflow-y-auto glass-card backdrop-blur-lg border border-white/20 rounded-xl">
          {results.map((r) => (
            <li key={r.id} className="px-3 py-2 hover:bg-white/20 text-sm">
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
