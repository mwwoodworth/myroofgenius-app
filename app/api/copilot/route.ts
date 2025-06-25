import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { chat, ChatMessage } from '../../lib/llm'

function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function fetchPromptTemplate(role: string): Promise<string> {
  let promptName = 'copilot_intro'
  if (role === 'field') promptName = 'copilot_field'
  else if (role === 'pm') promptName = 'copilot_pm'
  const { fetchPrompt } = await import('../../../prompts/service')
  const prompt = await fetchPrompt(promptName)
  return prompt || 'You are a helpful roofing assistant.'
}

export async function POST(req: NextRequest) {
  const { message, session_id, user_role } = await req.json()
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const sessionId = session_id || crypto.randomUUID()
  let userId: string | null = null
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const [, payloadBase64] = token.split('.')
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'))
      userId = payload.sub || null
    } catch {
      userId = null
    }
  }

  if (supabase) {
    await supabase.from('copilot_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: message
    })
  }

  const systemPrompt = await fetchPromptTemplate(user_role)
  const messages: ChatMessage[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  if (supabase) {
    const { data: history } = await supabase
      .from('copilot_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20)
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content })
      }
    } else {
      messages.push({ role: 'user', content: message })
    }
  } else {
    messages.push({ role: 'user', content: message })
  }

  let assistantResponse: string
  try {
    assistantResponse = await chat(messages)
  } catch (error) {
    console.error('Copilot AI Error:', error)
    assistantResponse = "I'm sorry, I couldn't find an answer. Please try again."
  }

  if (supabase) {
    await supabase.from('copilot_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: assistantResponse
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const words = assistantResponse.split(' ')
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '))
        await new Promise(res => setTimeout(res, 30))
      }
      controller.close()
    }
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Session-Id': sessionId }
  })
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)
  const sid = searchParams.get('sessionId')
  if (!supabase || !sid) {
    return NextResponse.json({ history: [] })
  }
  const { data } = await supabase
    .from('copilot_messages')
    .select('role, content, created_at')
    .eq('session_id', sid)
    .order('created_at', { ascending: true })
    .limit(50)
  return NextResponse.json({ history: data || [] })
}
