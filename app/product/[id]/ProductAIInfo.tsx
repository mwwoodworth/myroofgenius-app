'use client'
import { useEffect, useState } from 'react';

export default function ProductAIInfo({ id, name, description }: { id: string; name: string; description: string }) {
  const [summary, setSummary] = useState('');
  useEffect(() => {
    async function run() {
      try {
        const res = await fetch('/api/product-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data.summary || '');
        }
      } catch {
        /* ignore */
      }
    }
    run();
  }, [id, name, description]);

  if (!summary) return null;
  return <p className="mt-4 text-gray-700 italic">{summary}</p>;
}
