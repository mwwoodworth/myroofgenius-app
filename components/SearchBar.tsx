'use client'
import { useState } from 'react'

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
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==='Enter') search() }}
        placeholder="Search..."
        className="border px-2 py-1 rounded"
      />
      {results.length>0 && (
        <ul className="absolute bg-white border mt-1 w-full z-10 max-h-64 overflow-y-auto">
          {results.map(r=> (
            <li key={r.id} className="px-2 py-1 hover:bg-gray-100 text-sm">
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
