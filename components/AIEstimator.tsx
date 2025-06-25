'use client'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Button from './ui/Button'
import '../app/styles/futuristic.css'

interface AnalysisResult {
  squareFeet: number
  damage: string
  confidence: number
}

export default function AIEstimator() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = (accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setResult(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

  const analyze = async () => {
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze-roof', { method: 'POST', body: data })
      if (res.ok) {
        const json = await res.json()
        setResult(json)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="estimator-glass p-6 rounded-xl text-center">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag & drop a roof photo, or click to select</p>}
      </div>
      <Button className="mt-4" onClick={analyze} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Analyze Roof'}
      </Button>
      {result && (
        <div className="mt-4 text-left">
          <p>Square Feet: {result.squareFeet}</p>
          <p>Damage: {result.damage}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  )
}
