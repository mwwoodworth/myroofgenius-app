import { NextRequest, NextResponse } from 'next/server'
import { getPrompt } from '../../../prompts'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Helper to create a Supabase client using the service role key so the
 * endpoint can store and read chat history. If the env vars are missing the
 * function returns null and the API operates in a stateless mode.
 */
function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Fetch a prompt template from the backend FastAPI service when available.
 * Falls back to the static prompt list used in tests.
 */

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

/**
 * Generate a response based on the user message. This demo implementation
 * simply echoes the input and checks for a few hard‑coded commands that
 * retrieve data from Supabase. In a real implementation this would call an
 * LLM with the full chat history.
 */
async function generateAnswer(
  message: string,
  supabase: SupabaseClient | null
): Promise<string> {
  const base = await fetchPrompt('copilot_intro')

  if (supabase) {
    if (/last\s+5\s+orders/i.test(message)) {
      const { data } = await supabase
        .from('orders')
        .select('id, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (data?.length) {
        const list = data
          .map((o) => `${o.id} - $${o.amount} on ${new Date(o.created_at).toLocaleDateString()}`)
          .join('\n')
        return `${base}\nHere are your last 5 orders:\n${list}`
      }
    }

    if (/best.*selling.*template/i.test(message)) {
      const { data } = await supabase
        .from('products')
        .select('name')
        .order('sales', { ascending: false })
        .limit(1)
        .single()
      if (data) {
        return `${base}\nYour best-selling template is ${data.name}.`
      }
    }
  }

  return `${base} You said: ${message}`
}

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json()

  const supabase = createAdminClient()
  const userId = 'demo-user'
  const sid = sessionId || crypto.randomUUID()

  if (supabase) {
    await supabase.from('copilot_messages').insert({
      session_id: sid,
      user_id: userId,
      role: 'user',
      content: message,
    })
  }

  const answer = await generateAnswer(message, supabase)

  if (supabase) {
    await supabase.from('copilot_messages').insert({
      session_id: sid,
      user_id: userId,
      role: 'assistant',
      content: answer,
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (const token of answer.split(' ')) {
        controller.enqueue(encoder.encode(token + ' '))
        await new Promise((r) => setTimeout(r, 50))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Session-Id': sid,
    },
  })
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)
  const sid = searchParams.get('sessionId')
  if (!supabase || !sid) return NextResponse.json({ history: [] })
  const { data } = await supabase
    .from('copilot_messages')
    .select('role, content, created_at')
    .eq('session_id', sid)
    .order('created_at', { ascending: true })
    .limit(50)
  return NextResponse.json({ history: data || [] })
}
