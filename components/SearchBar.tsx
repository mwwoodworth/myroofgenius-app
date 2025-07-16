'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{id: string; name: string; description: string}[]>([])
  const [searchStatus, setSearchStatus] = useState('')
  const liveRegionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (results.length > 0) {
      setSearchStatus(`Found ${results.length} results for "${query}"`)
    } else if (query && results.length === 0) {
      setSearchStatus(`No results found for "${query}"`)
    }
  }, [results, query])

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
        aria-label="Search"
        aria-describedby={results.length > 0 ? "search-results" : undefined}
        whileFocus={{ scale: 1.05 }}
        className="border px-3 py-2 rounded-[14px] backdrop-blur-lg bg-white/5 border-white/20 w-full"
      />
      {results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute mt-1 w-full z-10 max-h-64 overflow-y-auto backdrop-blur-lg bg-white/5 border border-white/20 rounded-[14px]"
        >
          {results.map((r) => (
            <li
              key={r.id}
              role="option"
              className="px-3 py-2 hover:bg-white/20 text-sm cursor-pointer"
              tabIndex={-1}
            >
              {r.name}
            </li>
          ))}
        </ul>
      )}
      {/* Live region for search status announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {searchStatus}
      </div>
    </motion.div>
  );
}
