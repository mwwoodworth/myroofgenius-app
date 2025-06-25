import { NextRequest, NextResponse } from 'next/server'
import { getPrompt } from '../../../prompts'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  const base = getPrompt('copilot_intro')
  const reply = `${base} You said: ${message}`
  return NextResponse.json({ reply })
}
