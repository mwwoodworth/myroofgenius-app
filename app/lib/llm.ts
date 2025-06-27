export type LLMProvider = 'openai' | 'claude' | 'gemini'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | any
}

export async function chatStream(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  provider?: LLMProvider
) {
  const p = provider || (process.env.LLM_PROVIDER as LLMProvider) || 'openai'
  if (p !== 'openai') {
    const full = await chat(messages, p)
    onChunk(full)
    return
  }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      stream: true,
    }),
  })
  if (!res.ok || !res.body) throw new Error('OpenAI stream failed')
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.trim().startsWith('data:'))
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, '')
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const content = json.choices?.[0]?.delta?.content
        if (content) onChunk(content)
      } catch {
        /* ignore JSON errors */
      }
    }
  }
}

async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      max_tokens: 400,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callClaude(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('Claude API key not set, falling back to OpenAI')
    return callOpenAI(messages)
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 400,
      messages,
    }),
  })
  const data = await res.json()
  return data?.content?.[0]?.text || ''
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('Gemini API key not set, falling back to OpenAI')
    return callOpenAI(messages)
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: messages.map(m => ({ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) })) }] }),
    },
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export async function chat(messages: ChatMessage[], provider?: LLMProvider) {
  const p = provider || (process.env.LLM_PROVIDER as LLMProvider) || 'openai'
  switch (p) {
    case 'claude':
      return callClaude(messages)
    case 'gemini':
      return callGemini(messages)
    default:
      return callOpenAI(messages)
  }
}
