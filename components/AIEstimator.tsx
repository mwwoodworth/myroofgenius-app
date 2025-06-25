'use client'
import { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Button from './ui/Button'
import '../app/styles/futuristic.css'

interface AnalysisResult {
  squareFeet: number
  damage: string
  confidence: number
  bbox?: [number, number, number, number]
}

export default function AIEstimator() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [sqft, setSqft] = useState('')
  const [damage, setDamage] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)

  const onDrop = (accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setResult(null)
      setSaved(false)
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
        setSqft(String(json.squareFeet))
        setDamage(json.damage)
      }
    } finally {
      setLoading(false)
    }
  }

  const confirm = async () => {
    if (!result || !file) return
    setError('')
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        await fetch('/api/ai/save-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            squareFeet: Number(sqft),
            damage,
            confidence: result.confidence,
            bbox: result.bbox,
            image: reader.result,
          }),
        })
        setSaved(true)
      } catch (e) {
        setError('Save failed')
      }
    }
    reader.readAsDataURL(file)
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
          <div className="relative inline-block">
            <img ref={imgRef} src={URL.createObjectURL(file!)} alt="upload" className="max-w-full" />
            {result.bbox && (
              <div
                className="absolute border-2 border-red-500"
                style={{
                  left: result.bbox[0],
                  top: result.bbox[1],
                  width: result.bbox[2],
                  height: result.bbox[3],
                }}
              />
            )}
          </div>
          <div className="mt-2 space-y-2">
            <label className="block">
              <span className="mr-2">Square Feet:</span>
              <input
                className="border px-2 py-1 rounded"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mr-2">Damage:</span>
              <input
                className="border px-2 py-1 rounded"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
              />
            </label>
            <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            <Button onClick={confirm}>Confirm</Button>
            {error && <p className="text-red-500">{error}</p>}
            {saved && <p className="text-green-600">Saved!</p>}
          </div>
        </div>
      )}
    </div>
  )
}
