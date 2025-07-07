'use client'
import { useState } from 'react'
import Modal from '../ui/Modal'

export default function ToolDemoModal({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const run = () => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setResult(Number((num * 1.1).toFixed(2)))
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">{title} Demo</h2>
      {result === null ? (
        <div className="space-y-4">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a sample value"
            className="w-full px-3 py-2 rounded text-gray-900"
          />
          <button onClick={run} className="px-4 py-2 bg-blue-600 text-white rounded">
            See Result
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-lg">Estimated result: <strong>{result}</strong></p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create Free Account
          </button>
        </div>
      )}
    </Modal>
  )
}
