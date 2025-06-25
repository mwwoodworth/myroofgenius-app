import { NextRequest, NextResponse } from 'next/server'
import { getPrompt } from '../../../prompts'

async function fetchPrompt(name: string) {
  const baseUrl = process.env.API_BASE_URL
  if (!baseUrl) return getPrompt(name)
  try {
    const res = await fetch(`${baseUrl}/api/prompt/${name}`)
    if (res.ok) {
      const data = await res.json()
      return data.prompt as string
    }
  } catch (e) {
    console.error('prompt fetch failed', e)
  }
  return getPrompt(name)
}

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const base = await fetchPrompt('copilot_intro')
  const reply = `${base} You said: ${message}`
  return NextResponse.json({ reply })
}
