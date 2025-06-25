export async function analyzeRoofImage(file: File) {
  // Placeholder that would call custom vision model
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/ai/analyze-roof', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('analysis failed')
  return res.json()
}

export async function chatWithAssistant(message: string) {
  // Placeholder for GPT-4 integration
  return `AI says: ${message}`
}
